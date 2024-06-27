document.addEventListener('DOMContentLoaded', function() {

    // To get a random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // To change background color
    function changeBackgroundColor() {
        const newColor = getRandomColor();
        document.body.style.backgroundColor = newColor; 
    }

    // Set time
    setInterval(changeBackgroundColor, 3000);
})