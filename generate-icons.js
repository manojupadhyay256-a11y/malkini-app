const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, 'public', 'icon.png');
const publicDir = path.join(__dirname, 'public');
const appDir = path.join(__dirname, 'src', 'app');

async function generateIcons() {
    try {
        if (!fs.existsSync(sourceIcon)) {
            console.error('Source icon not found at:', sourceIcon);
            return;
        }

        console.log('Generating icons from:', sourceIcon);

        // 1. PWA 192x192
        await sharp(sourceIcon)
            .resize(192, 192)
            .toFile(path.join(publicDir, 'icon-192x192.png'));
        console.log('Generated: public/icon-192x192.png');

        // 2. PWA 512x512
        await sharp(sourceIcon)
            .resize(512, 512)
            .toFile(path.join(publicDir, 'icon-512x512.png'));
        console.log('Generated: public/icon-512x512.png');

        // 3. Next.js App Icon (Favicon)
        await sharp(sourceIcon)
            .resize(512, 512)
            .toFile(path.join(appDir, 'icon.png'));
        console.log('Generated: src/app/icon.png');

        // 4. Apple Touch Icon
        await sharp(sourceIcon)
            .resize(180, 180)
            .toFile(path.join(appDir, 'apple-icon.png'));
        console.log('Generated: src/app/apple-icon.png');

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
