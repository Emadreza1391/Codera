const ALLOWED_EXTENSIONS = [
  "pdf","zip","rar","doc","docx","ppt","pptx","jpg","jpeg","png","txt"
];

function safeName(value) {
  return value
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100) || "unknown";
}

function getExtension(filename) {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST")
      return json({error: "Method not allowed"}, 405);

    try {
      const body = await request.json();

      const name = String(body.name || "").trim();
      const course = String(body.course || "").trim();
      const description = String(body.description || "").trim();
      const fileName = String(body.fileName || "").trim();
      const mimeType = String(body.mimeType || "application/octet-stream");
      const fileBase64 = String(body.fileBase64 || "");

      if (!name || !course || !fileName || !fileBase64)
        return json({error: "اطلاعات ناقص است."}, 400);

      const extension = getExtension(fileName);

      if (!ALLOWED_EXTENSIONS.includes(extension))
        return json({error: "فرمت فایل مجاز نیست."}, 400);

      const approximateBytes = Math.floor(fileBase64.length * 3 / 4);

      if (approximateBytes > 10 * 1024 * 1024)
        return json({error: "حجم فایل بیشتر از 10MB است."}, 413);

      if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO)
        return json({error: "تنظیمات GitHub روی Worker کامل نشده است."}, 500);

      const now = new Date();
      const stamp = now.toISOString().replace(/[:.]/g, "-");

      const courseName = safeName(course);
      const studentName = safeName(name);
      const cleanFileName = safeName(fileName);

      const filePath =
        `homework/${courseName}/${stamp}_${studentName}_${cleanFileName}`;

      const githubUrl =
        `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${filePath}`;

      const upload = await fetch(githubUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Kodera-Homework-Upload",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `ارسال تکلیف: ${name} - ${course}`,
          content: fileBase64
        })
      });

      const result = await upload.json();

      if (!upload.ok) {
        return json({
          error: "خطا در ذخیره فایل در GitHub.",
          details: result.message || "Unknown GitHub error"
        }, 502);
      }

      const metadata = {
        name,
        course,
        description,
        fileName,
        mimeType,
        submittedAt: now.toISOString()
      };

      const metadataPath = `${filePath}.json`;
      const metadataContent = btoa(
        unescape(encodeURIComponent(JSON.stringify(metadata, null, 2)))
      );

      await fetch(
        `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${metadataPath}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "Kodera-Homework-Upload",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: `اطلاعات تکلیف: ${name} - ${course}`,
            content: metadataContent
          })
        }
      );

      return json({
        ok: true,
        message: "تکلیف با موفقیت ذخیره شد."
      });

    } catch (error) {
      return json({error: "خطای داخلی Worker."}, 500);
    }
  }
};
