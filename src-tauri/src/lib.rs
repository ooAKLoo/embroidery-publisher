use base64::Engine;
use once_cell::sync::Lazy;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::async_runtime;
use visioncortex::PathSimplifyMode;
use vtracer::{ColorImage, ColorMode, Config, Hierarchical, Preset};
use warp::Filter;

mod fred_api;
mod apple_music;

use fred_api::{
    build_indicator_data, clean_fred_data, detect_signals, fetch_fred_series,
    IndicatorData, SignalResult, INDICATORS,
};
use apple_music::{fetch_apple_music_playlist, get_apple_music_token, fetch_lyrics_batch, scan_music_files, fix_music_extensions, list_music_files, embed_lyrics_batch, fetch_and_embed_lyrics, merge_copy_files};

// 全局状态存储
static CONTENT_STATE: Lazy<Arc<RwLock<ContentState>>> =
    Lazy::new(|| Arc::new(RwLock::new(ContentState::default())));

// 市场指标缓存
static MARKET_CACHE: Lazy<Arc<RwLock<MarketCache>>> =
    Lazy::new(|| Arc::new(RwLock::new(MarketCache::default())));

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct MarketCache {
    pub indicators: Vec<IndicatorData>,
    pub signals: Vec<SignalResult>,
    pub last_updated: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ContentState {
    pub platform_texts: HashMap<String, String>,
    pub generated_title: String,
    pub images: Vec<ImageInfo>,
    pub account_profile: AccountProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub file_type: String,
    pub preview: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AccountProfile {
    pub display_name: String,
    pub username: String,
    pub avatar: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VTracerConfigInput {
    pub color_mode: Option<String>,
    pub hierarchical: Option<String>,
    pub mode: Option<String>,
    pub filter_speckle: Option<u32>,
    pub color_precision: Option<i32>,
    pub layer_difference: Option<i32>,
    pub corner_threshold: Option<i32>,
    pub length_threshold: Option<f64>,
    pub max_iterations: Option<u32>,
    pub splice_threshold: Option<i32>,
    pub path_precision: Option<u32>,
    pub preset: Option<String>,
}

impl VTracerConfigInput {
    fn to_config(&self) -> Result<Config, String> {
        let mut config = if let Some(preset) = self
            .preset
            .as_deref()
            .and_then(|value| parse_preset(value))
        {
            Config::from_preset(preset)
        } else {
            Config::default()
        };

        if let Some(value) = self.color_mode.as_deref() {
            config.color_mode = parse_color_mode(value);
        }
        if let Some(value) = self.hierarchical.as_deref() {
            config.hierarchical = parse_hierarchical(value);
        }
        if let Some(value) = self.mode.as_deref() {
            config.mode = parse_mode(value);
        }
        if let Some(value) = self.filter_speckle {
            config.filter_speckle = value as usize;
        }
        if let Some(value) = self.color_precision {
            config.color_precision = value;
        }
        if let Some(value) = self.layer_difference {
            config.layer_difference = value;
        }
        if let Some(value) = self.corner_threshold {
            config.corner_threshold = value;
        }
        if let Some(value) = self.length_threshold {
            config.length_threshold = value.max(0.0);
        }
        if let Some(value) = self.max_iterations {
            config.max_iterations = value as usize;
        }
        if let Some(value) = self.splice_threshold {
            config.splice_threshold = value;
        }
        if let Some(value) = self.path_precision {
            config.path_precision = if value == 0 { None } else { Some(value) };
        }

        Ok(config)
    }
}

fn parse_color_mode(value: &str) -> ColorMode {
    match value.trim().to_lowercase().as_str() {
        "binary" | "bw" | "b/w" => ColorMode::Binary,
        _ => ColorMode::Color,
    }
}

fn parse_hierarchical(value: &str) -> Hierarchical {
    match value.trim().to_lowercase().as_str() {
        "cutout" => Hierarchical::Cutout,
        _ => Hierarchical::Stacked,
    }
}

fn parse_mode(value: &str) -> PathSimplifyMode {
    match value.trim().to_lowercase().as_str() {
        "polygon" => PathSimplifyMode::Polygon,
        "spline" => PathSimplifyMode::Spline,
        "none" | "pixel" => PathSimplifyMode::None,
        _ => PathSimplifyMode::Spline,
    }
}

fn parse_preset(value: &str) -> Option<Preset> {
    match value.trim().to_lowercase().as_str() {
        "bw" | "b/w" | "binary" => Some(Preset::Bw),
        "photo" => Some(Preset::Photo),
        "clipart" => Some(Preset::Poster),
        "poster" => Some(Preset::Poster),
        _ => None,
    }
}

fn decode_base64_image(data: &str) -> Result<Vec<u8>, String> {
    let base64_data = if let Some((_, encoded)) = data.split_once(',') {
        encoded
    } else {
        data
    };
    base64::engine::general_purpose::STANDARD
        .decode(base64_data.as_bytes())
        .map_err(|err| format!("Base64 解码失败: {err}"))
}

// Tauri 命令：更新内容状态
#[tauri::command]
fn update_content(
    platform_texts: HashMap<String, String>,
    generated_title: String,
    images: Vec<ImageInfo>,
    account_profile: AccountProfile,
) -> Result<(), String> {
    let mut state = CONTENT_STATE.write();
    state.platform_texts = platform_texts;
    state.generated_title = generated_title;
    state.images = images;
    state.account_profile = account_profile;
    Ok(())
}

// Tauri 命令：获取当前内容状态
#[tauri::command]
fn get_content() -> ContentState {
    CONTENT_STATE.read().clone()
}

// Tauri 命令：图片矢量化
#[tauri::command]
async fn vectorize_image(
    image_base64: String,
    config: VTracerConfigInput,
) -> Result<String, String> {
    async_runtime::spawn_blocking(move || {
        let bytes = decode_base64_image(&image_base64)?;
        let image =
            image::load_from_memory(&bytes).map_err(|err| format!("读取图片失败: {err}"))?;
        let rgba = image.to_rgba8();
        let width = rgba.width() as usize;
        let height = rgba.height() as usize;
        let color_image = ColorImage {
            pixels: rgba.into_raw(),
            width,
            height,
        };

        let tracer_config = config.to_config()?;
        let svg = vtracer::convert(color_image, tracer_config)
            .map_err(|err| format!("矢量化失败: {err}"))?;
        Ok(svg.to_string())
    })
    .await
    .map_err(|err| format!("矢量化任务失败: {err}"))?
}

// Tauri 命令：获取市场指标数据
#[tauri::command(rename_all = "camelCase")]
async fn fetch_market_indicators(api_key: String) -> Result<MarketCache, String> {
    println!("收到 API Key: {}...", &api_key[..8]);
    let mut indicators = Vec::new();

    for (i, config) in INDICATORS.iter().enumerate() {
        // 每个请求之间稍微延迟，避免限流
        if i > 0 {
            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        }

        match fetch_fred_series(config.series_id, &api_key, 24).await {
            Ok(response) => {
                let unit = response.units.clone();
                let data = clean_fred_data(response);
                let indicator = build_indicator_data(config, data, unit);
                indicators.push(indicator);
            }
            Err(e) => {
                eprintln!("获取 {} 失败: {}", config.name, e);
            }
        }
    }

    let signals = detect_signals(&indicators);
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let cache = MarketCache {
        indicators,
        signals,
        last_updated: Some(now),
    };

    // 更新缓存
    {
        let mut market_cache = MARKET_CACHE.write();
        *market_cache = cache.clone();
    }

    Ok(cache)
}

// Tauri 命令：获取缓存的市场数据
#[tauri::command]
fn get_cached_market_data() -> MarketCache {
    MARKET_CACHE.read().clone()
}

// Tauri 命令：获取单个指标数据
#[tauri::command(rename_all = "camelCase")]
async fn fetch_single_indicator(
    series_id: String,
    api_key: String,
    limit: i32,
) -> Result<IndicatorData, String> {
    let config = INDICATORS
        .iter()
        .find(|c| c.series_id == series_id)
        .ok_or_else(|| format!("未知的指标 ID: {}", series_id))?;

    let response = fetch_fred_series(&series_id, &api_key, limit).await?;
    let unit = response.units.clone();
    let data = clean_fred_data(response);
    let indicator = build_indicator_data(config, data, unit);

    Ok(indicator)
}

// 启动 HTTP 服务器
async fn start_http_server() {
    // CORS 配置
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["GET", "POST", "OPTIONS"]);

    // API 路由: GET /api/content
    let get_content_route = warp::path!("api" / "content")
        .and(warp::get())
        .map(|| {
            let state = CONTENT_STATE.read().clone();
            warp::reply::json(&state)
        });

    // API 路由: GET /api/status
    let status_route = warp::path!("api" / "status")
        .and(warp::get())
        .map(|| warp::reply::json(&serde_json::json!({"status": "running", "version": "1.0.0"})));

    let routes = get_content_route.or(status_route).with(cors);

    println!("Chrome 插件 API 服务器启动在 http://localhost:9527");

    warp::serve(routes).run(([127, 0, 0, 1], 9527)).await;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 在后台启动 HTTP 服务器
    std::thread::spawn(|| {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(start_http_server());
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            update_content,
            get_content,
            vectorize_image,
            fetch_market_indicators,
            get_cached_market_data,
            fetch_single_indicator,
            get_apple_music_token,
            fetch_apple_music_playlist,
            fetch_lyrics_batch,
            scan_music_files,
            fix_music_extensions,
            list_music_files,
            embed_lyrics_batch,
            fetch_and_embed_lyrics,
            merge_copy_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
