use chrono::Utc;
use serde::{Deserialize, Serialize};

// FRED API 响应结构
#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct FredResponse {
    pub realtime_start: String,
    pub realtime_end: String,
    pub observation_start: String,
    pub observation_end: String,
    pub units: String,
    pub count: i32,
    pub observations: Vec<FredObservation>,
}

#[derive(Debug, Deserialize)]
pub struct FredObservation {
    pub date: String,
    pub value: String,
}

// 清洗后的数据点
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DataPoint {
    pub date: String,
    pub value: f64,
}

// 指标数据（包含元信息）
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndicatorData {
    pub series_id: String,
    pub name: String,
    pub full_name: String,
    pub unit: String,
    pub data: Vec<DataPoint>,
    pub latest_value: f64,
    pub previous_value: f64,
    pub change_percent: f64,
    pub trend: String, // "up", "down", "stable"
    pub fetched_at: String,
}

// 支持的指标配置
#[derive(Debug, Clone)]
pub struct IndicatorConfig {
    pub series_id: &'static str,
    pub name: &'static str,
    pub full_name: &'static str,
}

// 预定义的指标列表
pub const INDICATORS: &[IndicatorConfig] = &[
    // 美国核心指标
    IndicatorConfig {
        series_id: "CPIAUCSL",
        name: "CPI",
        full_name: "美国消费者价格指数",
    },
    IndicatorConfig {
        series_id: "PPIACO",
        name: "PPI",
        full_name: "美国生产者价格指数",
    },
    IndicatorConfig {
        series_id: "UMCSENT",
        name: "PWI",
        full_name: "消费者信心指数",
    },
    IndicatorConfig {
        series_id: "INDPRO",
        name: "INDPRO",
        full_name: "美国工业生产指数(制造+采矿+公用)",
    },
    IndicatorConfig {
        series_id: "IPMAN",
        name: "IPMAN",
        full_name: "美国制造业生产指数",
    },
    IndicatorConfig {
        series_id: "DGORDER",
        name: "DGORDER",
        full_name: "美国耐用品订单(领先指标)",
    },
    // 汇率
    IndicatorConfig {
        series_id: "DEXCHUS",
        name: "USD/CNY",
        full_name: "美元/人民币汇率",
    },
    IndicatorConfig {
        series_id: "DTWEXBGS",
        name: "DXY",
        full_name: "美元指数",
    },
    // 中国指标
    IndicatorConfig {
        series_id: "CHNCPIALLMINMEI",
        name: "CN-CPI",
        full_name: "中国消费者价格指数",
    },
    IndicatorConfig {
        series_id: "PIEATI01CNA661N",
        name: "CN-PPI",
        full_name: "中国生产者价格指数",
    },
];

// 从 FRED API 获取数据
pub async fn fetch_fred_series(
    series_id: &str,
    api_key: &str,
    limit: i32,
) -> Result<FredResponse, String> {
    let url = format!(
        "https://api.stlouisfed.org/fred/series/observations?series_id={}&api_key={}&file_type=json&sort_order=desc&limit={}",
        series_id, api_key, limit
    );

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .connect_timeout(std::time::Duration::from_secs(30))
        .pool_max_idle_per_host(0)  // 禁用连接池
        .build()
        .map_err(|e| format!("创建 HTTP 客户端失败: {}", e))?;

    println!("正在获取 FRED 数据: {} (URL: {})", series_id, &url[..80]);

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| {
            let err_msg = if e.is_timeout() {
                "请求超时".to_string()
            } else if e.is_connect() {
                format!("连接失败: {}", e)
            } else if e.is_request() {
                format!("请求错误: {}", e)
            } else {
                format!("网络错误: {}", e)
            };
            eprintln!("详细错误: {:?}", e);
            err_msg
        })?;

    println!("收到响应: {} - {}", series_id, response.status());

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("API 返回错误状态: {} - {}", status, body));
    }

    let fred_data: FredResponse = response
        .json()
        .await
        .map_err(|e| format!("解析 JSON 失败: {}", e))?;

    println!("成功解析 {} 数据, {} 条记录", series_id, fred_data.observations.len());

    Ok(fred_data)
}

// 清洗 FRED 数据
pub fn clean_fred_data(raw: FredResponse) -> Vec<DataPoint> {
    raw.observations
        .into_iter()
        .filter(|o| o.value != "." && !o.value.is_empty())
        .filter_map(|o| {
            o.value.parse::<f64>().ok().map(|value| DataPoint {
                date: o.date,
                value,
            })
        })
        .collect()
}

// 计算趋势
pub fn calculate_trend(data: &[DataPoint], periods: usize) -> String {
    if data.len() < periods + 1 {
        return "stable".to_string();
    }

    let recent_avg: f64 = data[..periods].iter().map(|d| d.value).sum::<f64>() / periods as f64;
    let prev_avg: f64 = data[periods..periods * 2]
        .iter()
        .map(|d| d.value)
        .sum::<f64>()
        / periods as f64;

    let change = (recent_avg - prev_avg) / prev_avg * 100.0;

    if change > 1.0 {
        "up".to_string()
    } else if change < -1.0 {
        "down".to_string()
    } else {
        "stable".to_string()
    }
}

// 构建完整的指标数据
pub fn build_indicator_data(
    config: &IndicatorConfig,
    data: Vec<DataPoint>,
    unit: String,
) -> IndicatorData {
    let latest_value = data.first().map(|d| d.value).unwrap_or(0.0);
    let previous_value = data.get(1).map(|d| d.value).unwrap_or(latest_value);
    let change_percent = if previous_value != 0.0 {
        (latest_value - previous_value) / previous_value * 100.0
    } else {
        0.0
    };
    let trend = calculate_trend(&data, 3);

    IndicatorData {
        series_id: config.series_id.to_string(),
        name: config.name.to_string(),
        full_name: config.full_name.to_string(),
        unit,
        data,
        latest_value,
        previous_value,
        change_percent,
        trend,
        fetched_at: Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
    }
}

// 危机信号检测结果
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalResult {
    pub signal_type: String,
    pub combo: String,
    pub label: String,
    pub meaning: String,
    pub action: String,
    pub severity: String,
    pub triggered: bool,
    pub values: SignalValues,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignalValues {
    pub ppi: Option<f64>,
    pub cpi: Option<f64>,
    pub pwi: Option<f64>,
    pub pmi: Option<f64>,
}

// 检测危机信号
pub fn detect_signals(indicators: &[IndicatorData]) -> Vec<SignalResult> {
    let mut signals = Vec::new();

    // 获取各指标趋势
    let ppi = indicators.iter().find(|i| i.name == "PPI");
    let cpi = indicators.iter().find(|i| i.name == "CPI");
    let pwi = indicators.iter().find(|i| i.name == "PWI");
    let pmi = indicators.iter().find(|i| i.name == "PMI");

    let ppi_trend = ppi.map(|i| i.trend.as_str()).unwrap_or("stable");
    let cpi_trend = cpi.map(|i| i.trend.as_str()).unwrap_or("stable");
    let pwi_trend = pwi.map(|i| i.trend.as_str()).unwrap_or("stable");
    let pmi_trend = pmi.map(|i| i.trend.as_str()).unwrap_or("stable");

    let values = SignalValues {
        ppi: ppi.map(|i| i.latest_value),
        cpi: cpi.map(|i| i.latest_value),
        pwi: pwi.map(|i| i.latest_value),
        pmi: pmi.map(|i| i.latest_value),
    };

    // 信号1: PPI ↑ + CPI — + PWI ↓ → 危险信号
    let signal1_triggered =
        ppi_trend == "up" && cpi_trend == "stable" && pwi_trend == "down";
    signals.push(SignalResult {
        signal_type: "danger_signal".to_string(),
        combo: "PPI ↑ + CPI — + PWI ↓".to_string(),
        label: "危险信号".to_string(),
        meaning: "造价在涨，生活压力大，消费者不想买非刚需品".to_string(),
        action: "追求现金流和留存，砍掉不赚钱的产品线，不要降价换市场".to_string(),
        severity: "danger".to_string(),
        triggered: signal1_triggered,
        values: values.clone(),
    });

    // 信号2: PMI ↑ + PWI ↑ → 过热信号
    let signal2_triggered = pmi_trend == "up" && pwi_trend == "up";
    signals.push(SignalResult {
        signal_type: "overheat_signal".to_string(),
        combo: "PMI ↑ + PWI ↑".to_string(),
        label: "过热信号".to_string(),
        meaning: "市场过热，订单多但可能面临产能压力".to_string(),
        action: "提前锁定供应商，考虑适度提价".to_string(),
        severity: "warning".to_string(),
        triggered: signal2_triggered,
        values: values.clone(),
    });

    // 信号3: PMI ↓ + PWI ↓ → 萎缩信号
    let signal3_triggered = pmi_trend == "down" && pwi_trend == "down";
    signals.push(SignalResult {
        signal_type: "shrink_signal".to_string(),
        combo: "PMI ↓ + PWI ↓".to_string(),
        label: "萎缩信号".to_string(),
        meaning: "市场收缩，订单减少，消费意愿低迷".to_string(),
        action: "收缩预算，优化产品细节，谨慎投放".to_string(),
        severity: "caution".to_string(),
        triggered: signal3_triggered,
        values: values.clone(),
    });

    // 信号4: PPI ↓ + PMI ↓ → 议价窗口
    let signal4_triggered = ppi_trend == "down" && pmi_trend == "down";
    signals.push(SignalResult {
        signal_type: "bargain_window".to_string(),
        combo: "PPI ↓ + PMI ↓".to_string(),
        label: "议价窗口".to_string(),
        meaning: "原材料降价，供应商订单少，议价空间大".to_string(),
        action: "积极谈判压价，锁定长期合同".to_string(),
        severity: "opportunity".to_string(),
        triggered: signal4_triggered,
        values: values.clone(),
    });

    // 信号5: CPI ↓ + PWI ↑ → 套利窗口
    let signal5_triggered = cpi_trend == "down" && pwi_trend == "up";
    signals.push(SignalResult {
        signal_type: "arbitrage_window".to_string(),
        combo: "CPI ↓ + PWI ↑".to_string(),
        label: "套利窗口".to_string(),
        meaning: "生活成本降低，消费者愿意花钱".to_string(),
        action: "加大投放，推新品，可适度提高溢价".to_string(),
        severity: "opportunity".to_string(),
        triggered: signal5_triggered,
        values,
    });

    signals
}
