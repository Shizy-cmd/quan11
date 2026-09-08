import { FRESHMAN_GUIDE, type GuideChapter } from "@/lib/freshmanGuide";
import { getObjectFromR2, uploadToR2 } from "@/lib/r2.server";

const GUIDE_KEY = "guides/freshman-guide.json";

/**
 * 读取新生指北内容：优先使用 R2 中保存的版本，否则回退到内置静态数据。
 */
export async function getGuideChapters(): Promise<GuideChapter[]> {
  try {
    const text = await getObjectFromR2(GUIDE_KEY);
    if (!text) return FRESHMAN_GUIDE;
    const parsed = JSON.parse(text) as GuideChapter[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return FRESHMAN_GUIDE;
  } catch {
    return FRESHMAN_GUIDE;
  }
}

/**
 * 将新生指北内容写入 R2（管理员操作，route 层负责鉴权）。
 */
export async function saveGuideChapters(chapters: GuideChapter[]): Promise<void> {
  await uploadToR2({
    key: GUIDE_KEY,
    body: new TextEncoder().encode(JSON.stringify(chapters)),
    contentType: "application/json",
  });
}
