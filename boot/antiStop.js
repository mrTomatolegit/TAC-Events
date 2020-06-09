exports.load = (client, reload) => {
    return new Promise(resolve => {
        if (reload) {
            return
        }
        console.log("Loading glitch-anti-stop")
        const http = require('http');
        const express = require('express');
        const app = express();
        app.get("/", (request, response) => {
            console.log(Date.now() + " Ping Received");
            response.sendStatus(200);
        });
        app.listen(process.env.PORT);
        setInterval(() => {
            http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
        }, 280000);
        resolve()
    })
}