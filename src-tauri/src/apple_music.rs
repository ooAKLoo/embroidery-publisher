use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use tauri::Emitter;
use id3::TagLike;

// Apple Music 配置
const TEAM_ID: &str = "9YFT3H8S93";
const KEY_ID: &str = "2B66TFC859";
const PRIVATE_KEY: &str = r#"-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgJ/AYiYvsoXJmuUFB
9W3vlh6avpGbsTCcmRJv9AIvSy6gCgYIKoZIzj0DAQehRANCAARJysfsU8QFbCZI
Zu4vYwfAmmFqECCj8bwETz9BWM0giNbweUmryvsyIM+kTJIs+/jSVLHCdY7a+hKo
X+1WAszS
-----END PRIVATE KEY-----"#;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    iss: String,
    iat: u64,
    exp: u64,
}

// 生成 Apple Music Developer Token
pub fn generate_developer_token() -> Result<String, String> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();

    let claims = Claims {
        iss: TEAM_ID.to_string(),
        iat: now,
        exp: now + 15777000, // ~6 months
    };

    let mut header = Header::new(Algorithm::ES256);
    header.kid = Some(KEY_ID.to_string());

    let key = EncodingKey::from_ec_pem(PRIVATE_KEY.as_bytes())
        .map_err(|e| format!("Failed to parse private key: {}", e))?;

    encode(&header, &claims, &key).map_err(|e| format!("Failed to encode JWT: {}", e))
}

// Tauri 命令：获取 Apple Music Developer Token
#[tauri::command]
pub fn get_apple_music_token() -> Result<String, String> {
    generate_developer_token()
}

// Apple Music API 响应结构
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistResponse {
    pub data: Vec<PlaylistData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistData {
    pub id: String,
    pub attributes: PlaylistAttributes,
    pub relationships: Option<PlaylistRelationships>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistAttributes {
    pub name: String,
    pub description: Option<Description>,
    pub curator_name: Option<String>,
    pub artwork: Option<Artwork>,
    pub track_count: Option<u32>,
    pub last_modified_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Description {
    pub standard: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artwork {
    pub url: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistRelationships {
    pub tracks: Option<TracksRelation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TracksRelation {
    pub data: Vec<TrackData>,
    pub next: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackData {
    pub id: String,
    pub attributes: TrackAttributes,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackAttributes {
    pub name: String,
    pub artist_name: String,
    pub album_name: String,
    pub duration_in_millis: Option<u64>,
    pub artwork: Option<Artwork>,
    pub previews: Option<Vec<Preview>>,
    pub isrc: Option<String>,
    pub genre_names: Option<Vec<String>>,
    pub release_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preview {
    pub url: String,
}

// 简化的播放列表信息
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub curator_name: String,
    pub artwork_url: Option<String>,
    pub track_count: u32,
    pub last_modified: Option<String>,
}

// 简化的歌曲信息
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackInfo {
    pub id: String,
    pub index: u32,
    pub name: String,
    pub artist_name: String,
    pub album_name: String,
    pub duration_ms: u64,
    pub duration: String,
    pub artwork_url: Option<String>,
    pub artwork_url_large: Option<String>,
    pub preview_url: Option<String>,
    pub isrc: Option<String>,
    pub genre_names: Vec<String>,
    pub release_date: Option<String>,
    pub apple_music_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FetchPlaylistResult {
    pub playlist: PlaylistInfo,
    pub tracks: Vec<TrackInfo>,
}

// 解析播放列表 URL
fn parse_playlist_url(url: &str) -> Option<(String, String)> {
    println!("解析 URL: {}", url);

    // https://music.apple.com/cn/playlist/xxx/pl.xxxx
    // 也支持查询参数如 ?l=zh-Hans-CN
    let re = regex::Regex::new(r"music\.apple\.com/([a-z]{2})/playlist/[^/]+/(pl\.[a-zA-Z0-9\-_]+)")
        .ok()?;
    if let Some(caps) = re.captures(url) {
        let storefront = caps[1].to_string();
        let playlist_id = caps[2].to_string();
        println!("解析结果: storefront={}, id={}", storefront, playlist_id);
        return Some((storefront, playlist_id));
    }

    // 直接输入 playlist ID
    if url.starts_with("pl.") {
        let playlist_id = url.split('?').next().unwrap_or(url).to_string();
        println!("直接 ID: {}", playlist_id);
        return Some(("cn".to_string(), playlist_id));
    }

    println!("无法解析 URL");
    None
}

// 格式化时长
fn format_duration(ms: u64) -> String {
    let seconds = ms / 1000;
    let mins = seconds / 60;
    let secs = seconds % 60;
    format!("{}:{:02}", mins, secs)
}

// 将 TrackData 转换为 TrackInfo
fn convert_track(track: &TrackData, index: u32, storefront: &str) -> TrackInfo {
    let attrs = &track.attributes;
    let duration_ms = attrs.duration_in_millis.unwrap_or(0);

    // 生成 Apple Music URL
    // 格式: https://music.apple.com/{storefront}/song/{id}
    let apple_music_url = format!(
        "https://music.apple.com/{}/song/{}",
        storefront, track.id
    );

    TrackInfo {
        id: track.id.clone(),
        index,
        name: attrs.name.clone(),
        artist_name: attrs.artist_name.clone(),
        album_name: attrs.album_name.clone(),
        duration_ms,
        duration: format_duration(duration_ms),
        artwork_url: attrs.artwork.as_ref().map(|a| {
            a.url.replace("{w}", "100").replace("{h}", "100")
        }),
        artwork_url_large: attrs.artwork.as_ref().map(|a| {
            a.url.replace("{w}", "500").replace("{h}", "500")
        }),
        preview_url: attrs
            .previews
            .as_ref()
            .and_then(|p| p.first().map(|pr| pr.url.clone())),
        isrc: attrs.isrc.clone(),
        genre_names: attrs.genre_names.clone().unwrap_or_default(),
        release_date: attrs.release_date.clone(),
        apple_music_url,
    }
}

// Tauri 命令：获取播放列表
#[tauri::command]
pub async fn fetch_apple_music_playlist(url_or_id: String) -> Result<FetchPlaylistResult, String> {
    let token = generate_developer_token()?;

    let (storefront, playlist_id) =
        parse_playlist_url(&url_or_id).ok_or("无效的播放列表 URL 或 ID")?;

    let client = reqwest::Client::new();

    // 第一次请求获取播放列表基本信息和前100首歌曲
    let api_url = format!(
        "https://api.music.apple.com/v1/catalog/{}/playlists/{}?include=tracks",
        storefront, playlist_id
    );

    let response = client
        .get(&api_url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API 错误 {}: {}", status, error_text));
    }

    let playlist_response: PlaylistResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;

    let playlist_data = playlist_response
        .data
        .first()
        .ok_or("未找到播放列表数据")?;

    let attrs = &playlist_data.attributes;

    let playlist_info = PlaylistInfo {
        id: playlist_data.id.clone(),
        name: attrs.name.clone(),
        description: attrs
            .description
            .as_ref()
            .and_then(|d| d.standard.clone())
            .unwrap_or_default(),
        curator_name: attrs
            .curator_name
            .clone()
            .unwrap_or_else(|| "Apple Music".to_string()),
        artwork_url: attrs.artwork.as_ref().map(|a| {
            a.url
                .replace("{w}", "300")
                .replace("{h}", "300")
        }),
        track_count: attrs.track_count.unwrap_or(0),
        last_modified: attrs.last_modified_date.clone(),
    };

    // 收集所有歌曲
    let mut all_tracks: Vec<TrackInfo> = Vec::new();
    let mut track_index = 1u32;

    // 添加第一批歌曲
    if let Some(tracks_rel) = playlist_data.relationships.as_ref().and_then(|r| r.tracks.as_ref()) {
        for track in &tracks_rel.data {
            all_tracks.push(convert_track(track, track_index, &storefront));
            track_index += 1;
        }

        // 如果有更多歌曲，继续分页获取
        let mut next_url = tracks_rel.next.clone();

        while let Some(ref next) = next_url {
            println!("获取更多歌曲: {}", next);

            // next 是相对路径，需要拼接完整 URL
            let full_url = format!("https://api.music.apple.com{}", next);

            let response = client
                .get(&full_url)
                .header("Authorization", format!("Bearer {}", token))
                .header("Content-Type", "application/json")
                .send()
                .await
                .map_err(|e| format!("分页请求失败: {}", e))?;

            if !response.status().is_success() {
                println!("分页请求失败，停止获取");
                break;
            }

            let tracks_response: TracksRelation = response
                .json()
                .await
                .map_err(|e| format!("解析分页响应失败: {}", e))?;

            for track in &tracks_response.data {
                all_tracks.push(convert_track(track, track_index, &storefront));
                track_index += 1;
            }

            next_url = tracks_response.next.clone();
        }
    }

    println!("共获取 {} 首歌曲", all_tracks.len());

    Ok(FetchPlaylistResult {
        playlist: playlist_info,
        tracks: all_tracks,
    })
}

// ============ 歌词获取功能 ============

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LyricsResult {
    pub song_id: String,
    pub song_name: String,
    pub artist_name: String,
    pub has_lyrics: bool,
    pub lyrics: Option<String>,           // 纯文本歌词
    pub time_synced_lyrics: Option<String>, // LRC 格式时间同步歌词
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchLyricsResult {
    pub total: u32,
    pub success: u32,
    pub failed: u32,
    pub results: Vec<LyricsResult>,
}

// 从 Apple Music 网页获取 access token
async fn fetch_access_token(client: &reqwest::Client) -> Result<String, String> {
    println!("获取 Apple Music access token...");

    let response = client
        .get("https://music.apple.com/us/browse")
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    let html = response.text().await.map_err(|e| format!("读取响应失败: {}", e))?;

    // 查找 index.js 文件
    let re = regex::Regex::new(r#"(?:index)([^"]*?)(?:\.js")"#).map_err(|e| e.to_string())?;
    let index_js = re
        .captures(&html)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str())
        .ok_or("未找到 index.js")?;

    let js_url = format!("https://music.apple.com/assets/index{}.js", index_js);
    let js_response = client
        .get(&js_url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await
        .map_err(|e| format!("请求 JS 失败: {}", e))?;

    let js_content = js_response.text().await.map_err(|e| e.to_string())?;

    // 提取 access token (eyJh 开头的 JWT)
    let token_re = regex::Regex::new(r#"(?:eyJh)([^"]*?)(?:")"#).map_err(|e| e.to_string())?;
    let token = token_re
        .captures(&js_content)
        .and_then(|c| c.get(0))
        .map(|m| m.as_str().trim_end_matches('"'))
        .ok_or("未找到 access token")?;

    Ok(token.to_string())
}

// 解析 TTML 歌词为 LRC 格式
fn parse_ttml_to_lrc(ttml: &str) -> (Option<String>, Option<String>) {
    let mut lyrics = Vec::new();
    let mut time_synced = Vec::new();

    // 简单的 XML 解析
    let p_re = regex::Regex::new(r#"<p[^>]*begin="([^"]*)"[^>]*>([^<]*)</p>"#).ok();
    let span_re = regex::Regex::new(r#"<span[^>]*begin="([^"]*)"[^>]*>([^<]*)</span>"#).ok();

    if let Some(re) = &p_re {
        for cap in re.captures_iter(ttml) {
            let begin = cap.get(1).map(|m| m.as_str()).unwrap_or("0:00");
            let text = cap.get(2).map(|m| m.as_str()).unwrap_or("");

            if !text.trim().is_empty() {
                lyrics.push(text.trim().to_string());
                let ts = parse_timestamp(begin);
                time_synced.push(format!("[{}]{}", ts, text.trim()));
            }
        }
    }

    // 如果 p 标签没有内容，尝试 span 标签
    if lyrics.is_empty() {
        if let Some(re) = &span_re {
            for cap in re.captures_iter(ttml) {
                let begin = cap.get(1).map(|m| m.as_str()).unwrap_or("0:00");
                let text = cap.get(2).map(|m| m.as_str()).unwrap_or("");

                if !text.trim().is_empty() {
                    lyrics.push(text.trim().to_string());
                    let ts = parse_timestamp(begin);
                    time_synced.push(format!("[{}]{}", ts, text.trim()));
                }
            }
        }
    }

    let lyrics_text = if lyrics.is_empty() { None } else { Some(lyrics.join("\n")) };
    let lrc_text = if time_synced.is_empty() { None } else { Some(time_synced.join("\n")) };

    (lyrics_text, lrc_text)
}

// 解析时间戳 (如 "1:23.456s" 或 "83.456s")
fn parse_timestamp(ts: &str) -> String {
    let ts = ts.trim_end_matches('s');

    if ts.contains(':') {
        let parts: Vec<&str> = ts.split(':').collect();
        if parts.len() == 2 {
            let mins: u32 = parts[0].parse().unwrap_or(0);
            let secs: f64 = parts[1].parse().unwrap_or(0.0);
            return format!("{:02}:{:05.2}", mins, secs);
        }
    }

    // 纯秒数
    let secs: f64 = ts.parse().unwrap_or(0.0);
    let mins = (secs / 60.0) as u32;
    let remaining_secs = secs % 60.0;
    format!("{:02}:{:05.2}", mins, remaining_secs)
}

// 获取单首歌曲歌词
async fn fetch_song_lyrics(
    client: &reqwest::Client,
    access_token: &str,
    media_user_token: &str,
    song_id: &str,
    storefront: &str,
) -> Result<(Option<String>, Option<String>), String> {
    let api_url = format!(
        "https://amp-api.music.apple.com/v1/catalog/{}/songs/{}",
        storefront, song_id
    );

    let response = client
        .get(&api_url)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("media-user-token", media_user_token)
        .header("Origin", "https://music.apple.com")
        .header("Referer", "https://music.apple.com/")
        .query(&[("include[songs]", "lyrics,syllable-lyrics")])
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("API 错误: {}", response.status()));
    }

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    // 尝试获取歌词
    let lyrics_data = json["data"][0]["relationships"]["lyrics"]["data"][0]["attributes"]["ttml"]
        .as_str();

    if let Some(ttml) = lyrics_data {
        Ok(parse_ttml_to_lrc(ttml))
    } else {
        Ok((None, None))
    }
}

// 进度事件数据
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LyricsProgress {
    pub current: u32,
    pub total: u32,
    pub song_name: String,
    pub artist_name: String,
    pub success: bool,
}

// Tauri 命令：批量获取歌词（带进度事件）
#[tauri::command]
pub async fn fetch_lyrics_batch(
    app: tauri::AppHandle,
    media_user_token: String,
    tracks: Vec<TrackInfo>,
    storefront: String,
    output_dir: String,
) -> Result<BatchLyricsResult, String> {
    let client = reqwest::Client::new();

    // 创建输出目录
    if !output_dir.is_empty() {
        std::fs::create_dir_all(&output_dir).map_err(|e| format!("创建目录失败: {}", e))?;
    }

    // 获取 access token
    let access_token = fetch_access_token(&client).await?;
    println!("Access token 获取成功");

    let mut results = Vec::new();
    let mut success_count = 0u32;
    let mut failed_count = 0u32;

    let total = tracks.len() as u32;

    for (i, track) in tracks.iter().enumerate() {
        let current = (i + 1) as u32;
        println!("[{}/{}] 获取歌词: {} - {}", current, total, track.name, track.artist_name);

        // 每次请求间隔，避免限流
        if i > 0 {
            tokio::time::sleep(std::time::Duration::from_millis(200)).await;
        }

        match fetch_song_lyrics(&client, &access_token, &media_user_token, &track.id, &storefront).await {
            Ok((lyrics, time_synced)) => {
                let has_lyrics = time_synced.is_some();

                // 保存文件
                if let Some(ref lrc) = time_synced {
                    let filename = sanitize_filename(&format!("{} - {}.lrc", track.name, track.artist_name));
                    let path = std::path::Path::new(&output_dir).join(&filename);

                    if let Err(e) = std::fs::write(&path, lrc) {
                        println!("保存歌词失败: {}", e);
                    }
                }

                if has_lyrics {
                    success_count += 1;
                } else {
                    failed_count += 1;
                }

                // 发送进度事件
                let _ = app.emit("lyrics-progress", LyricsProgress {
                    current,
                    total,
                    song_name: track.name.clone(),
                    artist_name: track.artist_name.clone(),
                    success: has_lyrics,
                });

                results.push(LyricsResult {
                    song_id: track.id.clone(),
                    song_name: track.name.clone(),
                    artist_name: track.artist_name.clone(),
                    has_lyrics,
                    lyrics,
                    time_synced_lyrics: time_synced,
                    error: None,
                });
            }
            Err(e) => {
                failed_count += 1;

                // 发送进度事件
                let _ = app.emit("lyrics-progress", LyricsProgress {
                    current,
                    total,
                    song_name: track.name.clone(),
                    artist_name: track.artist_name.clone(),
                    success: false,
                });

                results.push(LyricsResult {
                    song_id: track.id.clone(),
                    song_name: track.name.clone(),
                    artist_name: track.artist_name.clone(),
                    has_lyrics: false,
                    lyrics: None,
                    time_synced_lyrics: None,
                    error: Some(e),
                });
            }
        }
    }

    Ok(BatchLyricsResult {
        total,
        success: success_count,
        failed: failed_count,
        results,
    })
}

// 清理文件名中的非法字符
fn sanitize_filename(name: &str) -> String {
    let invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    let mut result = name.to_string();
    for c in invalid_chars {
        result = result.replace(c, "_");
    }
    result
}

// ============ 本地音乐文件格式修复功能 ============

// 文件格式检测结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileFormatInfo {
    pub file_name: String,
    pub file_path: String,
    pub current_extension: String,
    pub actual_format: String,
    pub needs_fix: bool,
    pub is_empty: bool,
}

// 格式修复结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FixExtensionResult {
    pub total_scanned: u32,
    pub mp3_to_m4a: u32,
    pub m4a_to_mp3: u32,
    pub empty_files: u32,
    pub already_correct: u32,
    pub fixed_files: Vec<FileFormatInfo>,
    pub empty_file_list: Vec<FileFormatInfo>,
}

// 检测文件实际格式
fn detect_audio_format(path: &std::path::Path) -> Option<String> {
    let mut file = std::fs::File::open(path).ok()?;
    let mut buffer = [0u8; 12];

    use std::io::Read;
    let bytes_read = file.read(&mut buffer).ok()?;

    if bytes_read == 0 {
        return Some("empty".to_string());
    }

    // 检测 MP3 格式
    // ID3v2 标签: 以 "ID3" 开头
    if buffer.starts_with(b"ID3") {
        // 需要进一步检查是否真的是 MP3
        // ID3 标签可能存在于 MP3 文件中，但也可能被误用
        // 读取更多数据来确认
        return Some("mp3".to_string());
    }

    // MP3 帧同步: 0xFF 0xFB, 0xFF 0xFA, 0xFF 0xF3, 0xFF 0xF2
    if buffer[0] == 0xFF && (buffer[1] & 0xE0) == 0xE0 {
        return Some("mp3".to_string());
    }

    // 检测 M4A/MP4/AAC 格式
    // ftyp box 通常在开头，格式为: [size][ftyp][brand]
    // 常见 brand: M4A, mp42, isom, iso2, mp41
    if bytes_read >= 8 {
        let ftyp_pos = if &buffer[4..8] == b"ftyp" {
            Some(8)
        } else if bytes_read >= 12 && &buffer[4..8] == b"ftyp" {
            Some(8)
        } else {
            None
        };

        if ftyp_pos.is_some() {
            // 这是一个 MP4/M4A 容器
            return Some("m4a".to_string());
        }
    }

    // 另一种检测 M4A 的方式：查找 "ftyp" 字符串
    let content_str = String::from_utf8_lossy(&buffer);
    if content_str.contains("ftyp") {
        return Some("m4a".to_string());
    }

    // FLAC 格式: 以 "fLaC" 开头
    if buffer.starts_with(b"fLaC") {
        return Some("flac".to_string());
    }

    // WAV 格式: 以 "RIFF" 开头
    if buffer.starts_with(b"RIFF") {
        return Some("wav".to_string());
    }

    // OGG 格式: 以 "OggS" 开头
    if buffer.starts_with(b"OggS") {
        return Some("ogg".to_string());
    }

    None
}

// 扫描目录中的音乐文件格式问题
#[tauri::command]
pub async fn scan_music_files(dir_path: String) -> Result<FixExtensionResult, String> {
    let path = std::path::Path::new(&dir_path);

    if !path.exists() || !path.is_dir() {
        return Err("目录不存在".to_string());
    }

    let mut total_scanned = 0u32;
    let mut mp3_to_m4a = 0u32;
    let mut m4a_to_mp3 = 0u32;
    let mut empty_files = 0u32;
    let mut already_correct = 0u32;
    let mut fixed_files = Vec::new();
    let mut empty_file_list = Vec::new();

    let entries = std::fs::read_dir(path).map_err(|e| format!("读取目录失败: {}", e))?;

    for entry in entries.flatten() {
        let file_path = entry.path();

        if !file_path.is_file() {
            continue;
        }

        let extension = file_path
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_lowercase())
            .unwrap_or_default();

        // 只处理音频文件
        if !["mp3", "m4a", "flac", "wav", "ogg", "aac"].contains(&extension.as_str()) {
            continue;
        }

        total_scanned += 1;

        let file_name = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let actual_format = detect_audio_format(&file_path);

        match actual_format {
            Some(ref format) if format == "empty" => {
                empty_files += 1;
                empty_file_list.push(FileFormatInfo {
                    file_name,
                    file_path: file_path.to_string_lossy().to_string(),
                    current_extension: extension,
                    actual_format: "空文件".to_string(),
                    needs_fix: false,
                    is_empty: true,
                });
            }
            Some(ref format) => {
                let needs_fix = format != &extension;

                if needs_fix {
                    if extension == "mp3" && format == "m4a" {
                        mp3_to_m4a += 1;
                    } else if extension == "m4a" && format == "mp3" {
                        m4a_to_mp3 += 1;
                    }

                    fixed_files.push(FileFormatInfo {
                        file_name,
                        file_path: file_path.to_string_lossy().to_string(),
                        current_extension: extension,
                        actual_format: format.clone(),
                        needs_fix,
                        is_empty: false,
                    });
                } else {
                    already_correct += 1;
                }
            }
            None => {
                already_correct += 1;
            }
        }
    }

    Ok(FixExtensionResult {
        total_scanned,
        mp3_to_m4a,
        m4a_to_mp3,
        empty_files,
        already_correct,
        fixed_files,
        empty_file_list,
    })
}

// 音乐文件信息
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MusicFileInfo {
    pub file_name: String,
    pub file_path: String,
    pub file_size: u64,
    pub extension: String,
}

// 列出目录中的所有音乐文件
#[tauri::command]
pub async fn list_music_files(dir_path: String) -> Result<Vec<MusicFileInfo>, String> {
    let path = std::path::Path::new(&dir_path);

    if !path.exists() || !path.is_dir() {
        return Err("目录不存在".to_string());
    }

    let mut files = Vec::new();
    let entries = std::fs::read_dir(path).map_err(|e| format!("读取目录失败: {}", e))?;

    for entry in entries.flatten() {
        let file_path = entry.path();

        if !file_path.is_file() {
            continue;
        }

        let extension = file_path
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_lowercase())
            .unwrap_or_default();

        // 只处理音频文件
        if !["mp3", "m4a", "flac", "wav", "ogg", "aac"].contains(&extension.as_str()) {
            continue;
        }

        let file_name = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_string();

        let metadata = std::fs::metadata(&file_path).ok();
        let file_size = metadata.map(|m| m.len()).unwrap_or(0);

        files.push(MusicFileInfo {
            file_name,
            file_path: file_path.to_string_lossy().to_string(),
            file_size,
            extension,
        });
    }

    // 按文件名排序
    files.sort_by(|a, b| a.file_name.cmp(&b.file_name));

    Ok(files)
}

// 修复文件扩展名
#[tauri::command]
pub async fn fix_music_extensions(
    app: tauri::AppHandle,
    files: Vec<FileFormatInfo>,
) -> Result<u32, String> {
    let mut fixed_count = 0u32;
    let total = files.len() as u32;

    for (i, file_info) in files.iter().enumerate() {
        if !file_info.needs_fix || file_info.is_empty {
            continue;
        }

        let old_path = std::path::Path::new(&file_info.file_path);
        let new_path = old_path.with_extension(&file_info.actual_format);

        // 检查目标文件是否已存在
        if new_path.exists() {
            println!("目标文件已存在，跳过: {:?}", new_path);
            continue;
        }

        match std::fs::rename(old_path, &new_path) {
            Ok(_) => {
                fixed_count += 1;
                println!("已修复: {} -> {}", file_info.file_name, new_path.file_name().unwrap_or_default().to_string_lossy());
            }
            Err(e) => {
                println!("修复失败 {}: {}", file_info.file_name, e);
            }
        }

        // 发送进度事件
        let _ = app.emit("fix-extension-progress", serde_json::json!({
            "current": i + 1,
            "total": total,
            "fileName": file_info.file_name,
        }));
    }

    Ok(fixed_count)
}

// ============ 歌词内封功能 ============

// 内封歌词请求
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmbedLyricsRequest {
    pub file_path: String,
    pub lyrics: String,       // 纯文本歌词或 LRC 格式
    pub track_id: String,     // Apple Music 歌曲 ID
    pub track_name: String,
    pub artist_name: String,
}

// 内封歌词结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmbedLyricsResult {
    pub total: u32,
    pub success: u32,
    pub failed: u32,
    pub results: Vec<EmbedLyricsSingleResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmbedLyricsSingleResult {
    pub file_path: String,
    pub track_name: String,
    pub success: bool,
    pub error: Option<String>,
}

// 为 M4A 文件内封歌词
fn embed_lyrics_m4a(file_path: &str, lyrics: &str) -> Result<(), String> {
    let mut tag = mp4ameta::Tag::read_from_path(file_path)
        .map_err(|e| format!("读取 M4A 文件失败: {}", e))?;

    // 设置歌词 (©lyr)
    tag.set_lyrics(lyrics);

    tag.write_to_path(file_path)
        .map_err(|e| format!("写入 M4A 文件失败: {}", e))?;

    Ok(())
}

// 为 MP3 文件内封歌词
fn embed_lyrics_mp3(file_path: &str, lyrics: &str) -> Result<(), String> {
    let mut tag = id3::Tag::read_from_path(file_path)
        .unwrap_or_else(|_| id3::Tag::new());

    // 使用 USLT 帧 (Unsynchronized Lyrics)
    let lyrics_frame = id3::frame::Lyrics {
        lang: "chi".to_string(),  // 中文
        description: String::new(),
        text: lyrics.to_string(),
    };
    tag.add_frame(lyrics_frame);

    tag.write_to_path(file_path, id3::Version::Id3v24)
        .map_err(|e| format!("写入 MP3 文件失败: {}", e))?;

    Ok(())
}

// 为 FLAC 文件内封歌词
fn embed_lyrics_flac(file_path: &str, lyrics: &str) -> Result<(), String> {
    let mut tag = metaflac::Tag::read_from_path(file_path)
        .map_err(|e| format!("读取 FLAC 文件失败: {}", e))?;

    // 获取或创建 Vorbis Comment
    let vorbis = tag.vorbis_comments_mut();

    // 设置 LYRICS 字段
    vorbis.set("LYRICS", vec![lyrics]);

    tag.write_to_path(file_path)
        .map_err(|e| format!("写入 FLAC 文件失败: {}", e))?;

    Ok(())
}

// 根据文件扩展名选择内封方式
fn embed_lyrics_to_file(file_path: &str, lyrics: &str) -> Result<(), String> {
    let path = std::path::Path::new(file_path);
    let extension = path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();

    match extension.as_str() {
        "m4a" | "mp4" | "aac" => embed_lyrics_m4a(file_path, lyrics),
        "mp3" => embed_lyrics_mp3(file_path, lyrics),
        "flac" => embed_lyrics_flac(file_path, lyrics),
        _ => Err(format!("不支持的文件格式: {}", extension)),
    }
}

// 批量内封歌词（从已获取的歌词数据）
#[tauri::command]
pub async fn embed_lyrics_batch(
    app: tauri::AppHandle,
    requests: Vec<EmbedLyricsRequest>,
) -> Result<EmbedLyricsResult, String> {
    let total = requests.len() as u32;
    let mut success = 0u32;
    let mut failed = 0u32;
    let mut results = Vec::new();

    for (i, req) in requests.iter().enumerate() {
        let result = embed_lyrics_to_file(&req.file_path, &req.lyrics);

        let single_result = match result {
            Ok(_) => {
                success += 1;
                EmbedLyricsSingleResult {
                    file_path: req.file_path.clone(),
                    track_name: req.track_name.clone(),
                    success: true,
                    error: None,
                }
            }
            Err(e) => {
                failed += 1;
                EmbedLyricsSingleResult {
                    file_path: req.file_path.clone(),
                    track_name: req.track_name.clone(),
                    success: false,
                    error: Some(e),
                }
            }
        };

        results.push(single_result.clone());

        // 发送进度事件
        let _ = app.emit("embed-lyrics-progress", serde_json::json!({
            "current": i + 1,
            "total": total,
            "trackName": req.track_name,
            "success": single_result.success,
        }));
    }

    Ok(EmbedLyricsResult {
        total,
        success,
        failed,
        results,
    })
}

// 获取歌词并内封到本地文件（一站式）
// 注意：tracks 和 local_files 是前端已匹配好的，索引一一对应
#[tauri::command]
pub async fn fetch_and_embed_lyrics(
    app: tauri::AppHandle,
    media_user_token: String,
    tracks: Vec<TrackInfo>,
    local_files: Vec<MusicFileInfo>,
    storefront: String,
) -> Result<EmbedLyricsResult, String> {
    let client = reqwest::Client::new();

    println!("=== 开始内封歌词 ===");
    println!("tracks 数量: {}, local_files 数量: {}", tracks.len(), local_files.len());

    // 获取 access token
    let access_token = fetch_access_token(&client).await?;

    let total = tracks.len() as u32;
    let mut success = 0u32;
    let mut failed = 0u32;
    let mut results = Vec::new();

    for (i, track) in tracks.iter().enumerate() {
        // 前端已经做好匹配，tracks[i] 对应 local_files[i]
        let local_file = local_files.get(i);

        println!("[{}/{}] 歌曲: {}", i + 1, total, track.name);
        if let Some(f) = local_file {
            println!("  -> 本地文件: {}", f.file_name);
            println!("  -> 文件路径: {}", f.file_path);
        } else {
            println!("  -> 无对应本地文件 (索引 {} 越界)", i);
        }

        let local_file = match local_file {
            Some(f) if !f.file_path.is_empty() => f,
            _ => {
                failed += 1;
                results.push(EmbedLyricsSingleResult {
                    file_path: String::new(),
                    track_name: track.name.clone(),
                    success: false,
                    error: Some("未找到匹配的本地文件".to_string()),
                });
                continue;
            }
        };

        // 获取歌词
        let lyrics_result = fetch_song_lyrics(
            &client,
            &access_token,
            &media_user_token,
            &track.id,
            &storefront,
        ).await;

        let lyrics = match lyrics_result {
            Ok((_, Some(lrc))) => lrc,  // 优先使用 LRC 格式
            Ok((Some(plain), None)) => plain,  // 使用纯文本
            Ok((None, None)) => {
                failed += 1;
                results.push(EmbedLyricsSingleResult {
                    file_path: local_file.file_path.clone(),
                    track_name: track.name.clone(),
                    success: false,
                    error: Some("该歌曲无歌词".to_string()),
                });

                let _ = app.emit("embed-lyrics-progress", serde_json::json!({
                    "current": i + 1,
                    "total": total,
                    "trackName": track.name,
                    "success": false,
                }));
                continue;
            }
            Err(e) => {
                failed += 1;
                results.push(EmbedLyricsSingleResult {
                    file_path: local_file.file_path.clone(),
                    track_name: track.name.clone(),
                    success: false,
                    error: Some(format!("获取歌词失败: {}", e)),
                });

                let _ = app.emit("embed-lyrics-progress", serde_json::json!({
                    "current": i + 1,
                    "total": total,
                    "trackName": track.name,
                    "success": false,
                }));
                continue;
            }
        };

        // 内封歌词
        let embed_result = embed_lyrics_to_file(&local_file.file_path, &lyrics);

        match embed_result {
            Ok(_) => {
                success += 1;
                results.push(EmbedLyricsSingleResult {
                    file_path: local_file.file_path.clone(),
                    track_name: track.name.clone(),
                    success: true,
                    error: None,
                });
            }
            Err(e) => {
                failed += 1;
                results.push(EmbedLyricsSingleResult {
                    file_path: local_file.file_path.clone(),
                    track_name: track.name.clone(),
                    success: false,
                    error: Some(e),
                });
            }
        }

        // 发送进度事件
        let _ = app.emit("embed-lyrics-progress", serde_json::json!({
            "current": i + 1,
            "total": total,
            "trackName": track.name,
            "success": results.last().map(|r| r.success).unwrap_or(false),
        }));

        // 避免限流
        if i > 0 {
            tokio::time::sleep(std::time::Duration::from_millis(200)).await;
        }
    }

    Ok(EmbedLyricsResult {
        total,
        success,
        failed,
        results,
    })
}

// ============ 合并下载功能 ============

// 合并下载请求
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MergeFileInfo {
    pub track_id: String,
    pub track_name: String,
    pub artist_name: String,
    pub album_name: String,
    pub playlist_id: String,
    pub playlist_name: String,
    pub source_path: String,
    pub file_name: String,
}

// 合并下载结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MergeCopyResult {
    pub total: u32,
    pub success: u32,
    pub failed: u32,
    pub output_dir: String,
}

// 合并复制文件到统一目录
#[tauri::command]
pub async fn merge_copy_files(
    app: tauri::AppHandle,
    files: Vec<MergeFileInfo>,
    output_dir: String,
) -> Result<MergeCopyResult, String> {
    // 创建输出目录
    std::fs::create_dir_all(&output_dir).map_err(|e| format!("创建目录失败: {}", e))?;

    let total = files.len() as u32;
    let mut success = 0u32;
    let mut failed = 0u32;

    // 用于跟踪重复文件名，添加序号后缀
    let mut used_names = std::collections::HashSet::new();

    for (i, file_info) in files.iter().enumerate() {
        let source_path = std::path::Path::new(&file_info.source_path);

        if !source_path.exists() {
            failed += 1;
            println!("源文件不存在: {}", file_info.source_path);
            continue;
        }

        // 生成目标文件名，处理重复
        // 先清理文件名中的非法字符
        let mut target_name = sanitize_filename(&file_info.file_name);
        let extension = source_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");
        let name_without_ext = target_name
            .strip_suffix(&format!(".{}", extension))
            .unwrap_or(&target_name)
            .to_string();

        let mut counter = 1;
        while used_names.contains(&target_name) {
            target_name = format!("{} ({}).{}", name_without_ext, counter, extension);
            counter += 1;
        }
        used_names.insert(target_name.clone());

        let target_path = std::path::Path::new(&output_dir).join(&target_name);

        // 复制文件
        match std::fs::copy(source_path, &target_path) {
            Ok(_) => {
                success += 1;
                println!("复制成功: {} -> {}", file_info.file_name, target_path.display());
            }
            Err(e) => {
                failed += 1;
                println!("复制失败 {}: {}", file_info.file_name, e);
            }
        }

        // 发送进度事件
        let _ = app.emit("merge-download-progress", serde_json::json!({
            "current": i + 1,
            "total": total,
            "fileName": target_name,
        }));
    }

    Ok(MergeCopyResult {
        total,
        success,
        failed,
        output_dir,
    })
}
