/**
 * Keep a number between a min and a max value
 * 
 * https://github.com/videojs/video.js/blob/4238f5c1d88890547153e7e1de7bd0d1d8e0b236/src/js/utils/clamp.js#L1-L19
 *
 * @param {number} number
 *        The number to clamp
 *
 * @param {number} min
 *        The minimum value
 * @param {number} max
 *        The maximum value
 *
 * @return {number}
 *         the clamped number
 */
const clamp = function (number, min, max) {
    number = Number(number);

    return Math.min(max, Math.max(min, isNaN(number) ? min : number));
};

export default clamp;
