// 調査専用。MIME・ヘッダーの推定は本番のファイル検証の代わりにはなりません。
export function inspectHeader(bytes) {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "JPEG";
    const png = [137, 80, 78, 71, 13, 10, 26, 10];
    if (png.every((value, index) => bytes[index] === value)) return "PNG";
    const word = (offset) => String.fromCharCode(...bytes.slice(offset, offset + 4));
    if (bytes.length >= 16 && word(4) === "ftyp") {
        const size = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0);
        if (size < 16 || size > bytes.length) return "ISO-BMFF（判定範囲外）";
        const brands = [word(8)];
        for (let offset = 16; offset + 4 <= size; offset += 4) brands.push(word(offset));
        if (brands.some((brand) => ["avif", "avis"].includes(brand))) return "AVIF（対象外）";
        if (brands.some((brand) => ["heic", "heix", "hevc", "hevx"].includes(brand))) return "HEIC系";
        if (brands.some((brand) => ["mif1", "msf1"].includes(brand))) return "HEIF系（コーデック未確定）";
        return "ISO-BMFF（対象未確定）";
    }
    return "不明";
}

export function summarize(records) {
    if (!records.length) return { count: 0, totalBytes: 0, meanBytes: null, maxBytes: null, projected100Bytes: null };
    const sizes = records.map((record) => record.sizeBytes);
    const totalBytes = sizes.reduce((total, size) => total + size, 0);
    return { count: sizes.length, totalBytes, meanBytes: totalBytes / sizes.length,
        maxBytes: Math.max(...sizes), projected100Bytes: totalBytes / sizes.length * 100 };
}

if (typeof document !== "undefined") setup();

function setup() {
    const byId = (id) => document.getElementById(id);
    const records = [];
    const urls = new Set();
    let generation = 0;
    const status = (message) => { byId("status").textContent = message; };
    const refresh = () => { byId("summary").textContent = JSON.stringify(summarize(records), null, 2); };
    function objectURL(blob) {
        const url = URL.createObjectURL(blob);
        urls.add(url);
        return url;
    }
    function download(blob, name) {
        const url = objectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => { URL.revokeObjectURL(url); urls.delete(url); }, 60000);
    }
    function selectField(article, label, choices, onChange) {
        const field = document.createElement("label");
        field.textContent = label + " ";
        const select = document.createElement("select");
        for (const value of choices) select.add(new Option(value, value));
        select.addEventListener("change", () => onChange(select.value));
        field.append(select);
        article.append(field);
    }
    byId("accept").addEventListener("change", () => {
        byId("files").accept = byId("accept").value;
        byId("files").value = "";
    });
    byId("files").addEventListener("change", async (event) => {
        const files = Array.from(event.target.files);
        const batch = { device: byId("device").value, source: byId("source").value,
            accept: byId("accept").value, testedAt: new Date().toISOString() };
        const current = generation;
        for (const file of files) {
            let bytes;
            try { bytes = new Uint8Array(await file.slice(0, 4096).arrayBuffer()); }
            catch (error) { status("ファイル読取失敗：" + error.message); continue; }
            if (current !== generation) return;
            const record = { ...batch, name: file.name, mime: file.type || "空",
                sizeBytes: file.size, headerGuess: inspectHeader(bytes), preview: "確認中",
                upload: "未検証（送信なし）", share: "未実施", download: "未実施",
                originalFormat: "不明", savedResult: "未確認", notes: "" };
            records.push(record);
            const article = document.createElement("article");
            const title = document.createElement("h2");
            title.textContent = file.name;
            const details = document.createElement("pre");
            details.textContent = JSON.stringify({ ...batch, mime: record.mime, sizeBytes: file.size,
                sizeMB: file.size / 1000000, headerGuess: record.headerGuess }, null, 2);
            const image = document.createElement("img");
            image.alt = "選択画像の表示テスト";
            const previewResult = document.createElement("p");
            const finishPreview = (result) => { record.preview = result; previewResult.textContent = result; };
            image.onload = () => finishPreview("表示成功 " + image.naturalWidth + "×" + image.naturalHeight);
            image.onerror = () => finishPreview("表示失敗（形式以外の原因も要確認）");
            image.src = objectURL(file);
            article.append(title, details, image, previewResult);
            selectField(article, "選択前の原本形式", ["不明", "JPEG", "PNG", "HEIC", "HEIF"], (value) => { record.originalFormat = value; });
            const share = document.createElement("button");
            share.type = "button";
            share.textContent = "この1枚を共有して保存を確認";
            share.addEventListener("click", async () => {
                try {
                    if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) {
                        record.share = "ファイル共有非対応／実行環境で許可されていない";
                    } else {
                        await navigator.share({ files: [file] });
                        record.share = "共有API完了（保存成功は別途確認）";
                    }
                } catch (error) {
                    record.share = error.name === "AbortError" ? "キャンセル等により中断" : "失敗：" + error.name;
                }
                status(record.share);
            });
            const save = document.createElement("button");
            save.type = "button";
            save.textContent = "この1枚をダウンロード";
            save.addEventListener("click", () => {
                download(file, file.name);
                record.download = "ダウンロード操作実行（保存成功は別途確認）";
                status(record.download);
            });
            article.append(share, save);
            selectField(article, "端末で確認した保存先", ["未確認", "写真アプリ", "ファイル／ダウンロード", "両方", "保存不可"], (value) => { record.savedResult = value; });
            const label = document.createElement("label");
            label.textContent = "メモ（使った保存方法、保存後の拡張子・再表示、原本との比較など）";
            const notes = document.createElement("textarea");
            notes.addEventListener("input", () => { record.notes = notes.value; });
            label.append(notes);
            article.append(label);
            byId("results").append(article);
            refresh();
        }
    });
    byId("export").addEventListener("click", () => {
        const report = { exportedAt: new Date().toISOString(), userAgent: navigator.userAgent,
            secureContext: window.isSecureContext, scope: "選択後File・ローカル表示・手動保存。実投稿は未検証。",
            summary: summarize(records), records };
        download(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }), "k01-results.json");
    });
    byId("reset").addEventListener("click", () => {
        generation += 1;
        records.length = 0;
        for (const url of urls) URL.revokeObjectURL(url);
        urls.clear();
        byId("results").replaceChildren();
        byId("files").value = "";
        refresh();
        status("結果をクリアしました。");
    });
    window.addEventListener("pagehide", () => { for (const url of urls) URL.revokeObjectURL(url); });
    refresh();
}
