import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post('/api/v1/bugreport', (req: Request, res: Response) => {
    try {
        saveData(req.body, () => {
            res.status(201).send('Got a POST request');
        });
    } catch (e) {
        res.status(500).send('error saving bugreport');
    }
});

app.listen(3000, () => console.log('listening on port 3000'));

const saveData = (data: string, success: () => void) => {
    const date = new Date(Date.now()).toUTCString().replace(/[\W_]+/g, '-');
    const fileName = `bugreport-${date}.json`;
    fs.writeFile(fileName, JSON.stringify(data, null, 4), (err) => {
        if (err) {
            console.log('error writing file', err);
            throw err;
        }
        console.log('data: ', data);
        console.log('json saved to: ', fileName);
        success();
    });
};
