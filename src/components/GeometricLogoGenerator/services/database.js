import Database from '@tauri-apps/plugin-sql';

let db = null;

// 初始化数据库
export async function initDatabase() {
  if (db) return db;

  try {
    db = await Database.load('sqlite:logo_configs.db');

    // 创建配置表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS logo_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        active_type TEXT NOT NULL,
        params TEXT NOT NULL,
        colors TEXT NOT NULL,
        stroke_width REAL NOT NULL,
        bg_color TEXT NOT NULL,
        common_styles TEXT NOT NULL,
        thumbnail TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    return db;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 保存配置
export async function saveConfig(config) {
  const database = await initDatabase();

  const { name, activeType, params, colors, strokeWidth, bgColor, commonStyles, thumbnail } = config;

  const result = await database.execute(
    `INSERT INTO logo_configs (name, active_type, params, colors, stroke_width, bg_color, common_styles, thumbnail)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      name,
      activeType,
      JSON.stringify(params),
      JSON.stringify(colors),
      strokeWidth,
      bgColor,
      JSON.stringify(commonStyles),
      thumbnail || null
    ]
  );

  return result.lastInsertId;
}

// 获取所有配置
export async function getAllConfigs() {
  const database = await initDatabase();

  const rows = await database.select(
    `SELECT * FROM logo_configs ORDER BY created_at DESC`
  );

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    activeType: row.active_type,
    params: JSON.parse(row.params),
    colors: JSON.parse(row.colors),
    strokeWidth: row.stroke_width,
    bgColor: row.bg_color,
    commonStyles: JSON.parse(row.common_styles),
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

// 获取单个配置
export async function getConfig(id) {
  const database = await initDatabase();

  const rows = await database.select(
    `SELECT * FROM logo_configs WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    activeType: row.active_type,
    params: JSON.parse(row.params),
    colors: JSON.parse(row.colors),
    strokeWidth: row.stroke_width,
    bgColor: row.bg_color,
    commonStyles: JSON.parse(row.common_styles),
    thumbnail: row.thumbnail,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// 删除配置
export async function deleteConfig(id) {
  const database = await initDatabase();

  await database.execute(
    `DELETE FROM logo_configs WHERE id = $1`,
    [id]
  );
}

// 更新配置
export async function updateConfig(id, config) {
  const database = await initDatabase();

  const { name, activeType, params, colors, strokeWidth, bgColor, commonStyles, thumbnail } = config;

  await database.execute(
    `UPDATE logo_configs
     SET name = $1, active_type = $2, params = $3, colors = $4, stroke_width = $5,
         bg_color = $6, common_styles = $7, thumbnail = $8, updated_at = CURRENT_TIMESTAMP
     WHERE id = $9`,
    [
      name,
      activeType,
      JSON.stringify(params),
      JSON.stringify(colors),
      strokeWidth,
      bgColor,
      JSON.stringify(commonStyles),
      thumbnail || null,
      id
    ]
  );
}
