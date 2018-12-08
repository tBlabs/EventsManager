import { injectable, multiInject } from 'inversify';
import { Types } from './IoC/Types';
import { IFlow } from './Flows/IFlow';
import { IBoard } from './Boards/IBoard';
import * as express from 'express';
import { Git } from './Utils/Git';
import { Lights } from './Actors/Lights';
import { HeartBeat } from './HeartBeat';
import { DateTimeProvider } from './services/DateTimeProvider/DateTimeProvider';

@injectable()
export class Main
{
    constructor(
        @multiInject(Types.IBoard) private _boards: IBoard[],
        @multiInject(Types.IFlow) private _flows: IFlow[],
        private _lights: Lights,
        private _time: DateTimeProvider,
        private _heartBeat: HeartBeat)
    { }

    public async Start(): Promise<void>
    {
        console.log('HCC START');

        const git = new Git();
        const ver = await git.Version();
        console.log('ver:', ver);

        const server = express();

        const shortcuts =
        {
            '/ping': (req, res) => console.log('ping'),
            '/lights': (req, res) => this._lights.NextLevel(),
            '/time': (req, res) => res.send(this._time.Now.toString()   )
        }

        const shortcutsUrls = Object.keys(shortcuts);
        shortcutsUrls.forEach(url =>
        {
            server.get(url, (req, res) =>
            {
                const action = shortcuts[url];

                action(req, res);

                res.send(202);
            });
        });

        this._heartBeat.BlinkBluePillsLeds();

        this._flows.forEach(f => f.Init());

        server.get('/detach', (req, res) =>
        {
            this._boards.forEach(b => b.Connector.Disconnect());

            res.send(200);
        });

        const port = 5000;
        server.listen(port, () => console.log('HCC SERVER STARTED @', port));
    }
}
