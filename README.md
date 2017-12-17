# rover-telemetry-ui
Telemetry UI to drive rovers using MQTT protocol

Comprehensive documentation link: https://app4mc-rover.github.io/rover-docs

# To use rover-telemetry-ui

```
git clone https://github.com/app4mc-rover/rover-telemetry-ui.git
cd rover-telemetry-ui

npm install socket.io express http path mqtt

cd scripts/
sudo node start_rovertelemetryui.js
```

Go to your web browser and find the page at `http://<your host address>:5055/rovertelemetryui.html`.