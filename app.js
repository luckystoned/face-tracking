const MODEL_URL = "/public/models";
const input = document.getElementById('myImg')
const useTinyModel = true;
let state = "undetected";

function getTop(l) {
    return l
        .map((a) => a.y)
        .reduce((a, b) => Math.min(a, b));
}

function getMeanPosition(l) {
    return l
        .map((a) => [a.x, a.y])
        .reduce((a, b) => [a[0] + b[0], a[1] + b[1]])
        .map((a) => a / l.length);
}

Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
]).then((val) => {
    faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .then((res) => {
        // Face is detected
        if (res) {
            //console.log(res);

            var eye_right = getMeanPosition(res.landmarks.getRightEye());
            var eye_left = getMeanPosition(res.landmarks.getLeftEye());
            var nose = getMeanPosition(res.landmarks.getNose());
            var mouth = getMeanPosition(res.landmarks.getMouth());
            var jaw = getTop(res.landmarks.getJawOutline());

            var rx = (jaw - mouth[1]) / res.detection.box.height + 0.5;
            var ry = (eye_left[0] + (eye_right[0] - eye_left[0]) / 2 - nose[0]) /
                res.detection.box.width;

            console.log(
                res.detection.score, //Face detection score
                ry, //Closest to 0 is looking forward
                rx // Closest to 0.5 is looking forward, closest to 0 is looking up
            );

            if (res.detection.score > 0.3) {
                state = "front";
                if (rx > 0.2) {
                    state = "top";
                } else {
                    if (ry < -0.04) {
                        state = "left";
                    }
                    if (ry > 0.04) {
                        state = "right";
                    }
                }
            }
        } else {
            // Face was not detected
        }

        console.log(state);
    })
}).catch((err) => {
    console.log(err)
});

