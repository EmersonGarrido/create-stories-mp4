// Import dependencies
const Jimp = require("jimp");
const fs = require("fs-extra");
const pathToFfmpeg = require("ffmpeg-static");
const util = require('util');

const exec = util.promisify(require('child_process').exec);

const videoEncoder = 'h264';
const inputFolder = './input';
const outputFolder = 'temp/edited-frames';
let currentProgress = 0;

 const checkProgress = (currentFrame, totalFrames) => {
    const progress = currentFrame / totalFrames * 100;
    if (progress > (currentProgress + 10)) {
        const displayProgress = Math.floor(progress);
        console.log(`Progress: ${displayProgress}%`);
        currentProgress = displayProgress;
    }
};


(async function () {
    try {
        const frames = fs.readdirSync(inputFolder);

        for (let frameCount = 1; frameCount <= frames.length; frameCount++) {
            checkProgress(frameCount, frames.length);
            let frame = await Jimp.read(`${inputFolder}/${frameCount}.jpg`);
            frame = await modifyFrame(frame);
            await frame.writeAsync(`${outputFolder}/${frameCount}.png`);
        }

        // ffmpeg -i ./assets/music.mp3 -f image2 -loop 1 -i ./assets/background.png -s 640x360 -r 30 -shortest output.mp4
        console.log('Encoding');
        await exec(`"${pathToFfmpeg}" -i ./sound-finish.mp3 -f image2 -i ${outputFolder}/%d.png -vcodec ${videoEncoder} -pix_fmt yuv420p output.mp4`);
    } catch (e) {
        console.log("An error occurred:", e);
        console.log('Cleaning up');
        await fs.remove('temp');
    }
})();


const modifyFrame = async (frame) => {

    let newHeight = 16 * frame.bitmap.width / 9;
    newHeight = newHeight % 2 === 0 ? newHeight : (newHeight + 1);

    const newImage = new Jimp(frame.bitmap.width, newHeight, 'white');

    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    
    newImage.print(font, 20, newImage.bitmap.height - 100, 'Siga o perfil');
    newImage.print(font, 20, newImage.bitmap.height - 100, '@emersongarridoo');
    newImage.composite(frame, 0, (newHeight / 2) - (frame.bitmap.height / 2));

    return newImage;
};
