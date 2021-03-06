import { injectable } from "inversify";
import { Sensor, SDS018SocketConnector } from 'air-pollution-sensor-client-lib/bin';

@injectable()
export class AirSensor
{
    private onLevelChangeCallback: any;

    constructor()
    {
        const connectionString = process.env.SDS018_DAEMON_ADDR;
        const connector = new SDS018SocketConnector(connectionString);
        const sensor = new Sensor(connector);

        sensor.OnChange((pm10, pm25) => 
        {
            if (this.onLevelChangeCallback)
                this.onLevelChangeCallback(pm25);
        });
    }

    public OnLevelChange(callback: (pm25: number) => void): void
    {
        this.onLevelChangeCallback = callback;
    }
}
