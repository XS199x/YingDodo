const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 图片目录
const IMAGE_DIR = path.join(__dirname, "src/static/images");

// 输出目录
const OUTPUT_DIR = path.join(IMAGE_DIR, "output");

// 最大体积 40KB
const MAX_SIZE = 40 * 1024;

// 支持格式
const imageExts = [".png", ".jpg", ".jpeg", ".webp"];

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 获取所有图片
function getAllImages(dir) {
    let results = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // 跳过 output 目录
            if (file === "output") continue;

            results = results.concat(getAllImages(filePath));
        } else {
            const ext = path.extname(file).toLowerCase();

            if (imageExts.includes(ext)) {
                results.push(filePath);
            }
        }
    }

    return results;
}

async function compressImage(inputPath) {
    const ext = path.extname(inputPath).toLowerCase();

    const relativePath = path.relative(IMAGE_DIR, inputPath);

    const outputPath = inputPath;

    // 创建子目录
    fs.mkdirSync(path.dirname(outputPath), {
        recursive: true,
    });

    let quality = 90;
    let buffer;

    while (quality >= 10) {
        let instance = sharp(inputPath).resize(128, 128);

        // 可选：缩放图标
        // instance = instance.resize(81, 81);

        if (ext === ".jpg" || ext === ".jpeg") {
            buffer = await instance
                .jpeg({
                    quality,
                    mozjpeg: true,
                })
                .toBuffer();
        } else if (ext === ".png") {
            buffer = await instance
                .png({
                    quality,
                    compressionLevel: 9,
                    palette: true,
                })
                .toBuffer();
        } else if (ext === ".webp") {
            buffer = await instance
                .webp({
                    quality,
                })
                .toBuffer();
        }

        console.log(
            `${relativePath} -> quality=${quality}, size=${(
                buffer.length / 1024
            ).toFixed(2)}KB`
        );

        if (buffer.length <= MAX_SIZE) {
            break;
        }

        quality -= 5;
    }

    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ 输出: ${outputPath}`);
}

(async () => {
    const images = getAllImages(IMAGE_DIR);

    console.log(`发现 ${images.length} 张图片`);

    for (const image of images) {
        try {
            await compressImage(image);
        } catch (err) {
            console.error(`❌ 失败: ${image}`);
            console.error(err);
        }
    }

    console.log("🎉 全部完成");
})();