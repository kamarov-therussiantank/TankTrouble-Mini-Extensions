window.getTimeAgo = function(unixTimestampInSeconds) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const secondsAgo = nowSeconds - unixTimestampInSeconds;
    const minute = 60;
    const hour = 3600;
    const day = 86400;
    const week = day * 7;
    const month = day * 30.44;
    const year = day * 365.25;

    if (secondsAgo < minute) {
        return `${secondsAgo} sec${secondsAgo !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < hour) {
        const minutes = Math.floor(secondsAgo / minute);
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < day) {
        const hours = Math.floor(secondsAgo / hour);
        return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < week) {
        const days = Math.floor(secondsAgo / day);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < month) {
        const weeks = Math.floor(secondsAgo / week);
        return `${weeks} wk${weeks !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < year) {
        const months = Math.floor(secondsAgo / month);
        return `${months} mo${months !== 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(secondsAgo / year);
        return `${years} yr${years !== 1 ? 's' : ''} ago`;
    }
}