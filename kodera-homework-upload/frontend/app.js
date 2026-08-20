const form = document.getElementById("homeworkForm");
const statusBox = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = type;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const file = document.getElementById("file").files[0];

  if (!file) return showStatus("لطفاً فایل تکلیف را انتخاب کنید.", "error");
  if (file.size > 10 * 1024 * 1024)
    return showStatus("حجم فایل نباید بیشتر از 10 مگابایت باشد.", "error");

  if (typeof API_URL === "undefined" || API_URL === "YOUR_WORKER_URL")
    return showStatus("آدرس Worker هنوز در config.js تنظیم نشده است.", "error");

  submitBtn.disabled = true;
  submitBtn.textContent = "در حال ارسال...";

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const base64 = reader.result.split(",")[1];

      const payload = {
        name: document.getElementById("name").value.trim(),
        course: document.getElementById("course").value,
        description: document.getElementById("description").value.trim(),
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileBase64: base64
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok)
        throw new Error(data.error || "ارسال انجام نشد.");

      form.reset();
      showStatus("✅ تکلیف شما با موفقیت ارسال شد.", "success");
    } catch (error) {
      showStatus("❌ " + error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "🚀 ارسال تکلیف";
    }
  };

  reader.onerror = () => {
    showStatus("❌ خطا در خواندن فایل.", "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "🚀 ارسال تکلیف";
  };

  reader.readAsDataURL(file);
});
