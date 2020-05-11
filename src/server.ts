import express, { Request, Response } from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
// @ts-ignore
import email from 'emailjs';

const LISTEN_PORT = 3000;
const LISTEN_HOST = '127.0.0.1';

const password = fs.readFileSync('password' , { encoding: 'utf8' });

const app = express();
app.use(bodyParser.text({
    type: 'text/plain',
}));

app.post('/api/v1/bugreport', (req: Request, res: Response) => {
    try {
        const dateString = timestampToDateString(Date.now(), true);
        saveData(req.body, dateString, () => {
            res.status(201).send('Got a POST request');
        });
        sendEmail(req.body, dateString);
    } catch (e) {
        res.status(500).send('error saving bugreport');
    }
});

app.listen(LISTEN_PORT, LISTEN_HOST, () => console.log('listening on port 3000'));

const saveData = (data: string, dateString: string, success: () => void) => {
    const fileName = `bugreport-${dateString}.txt`;
    fs.writeFile(fileName, data, (err) => {
        if (err) {
            console.log('error writing file', err);
            throw err;
        }
        console.log('json saved to: ', fileName);
        success();
    });
};

const sendEmail = (data: string, dateString: string) => {
    const server = email.server.connect({
        user: 'felfelebugreport',
        password,
        host: 'smtp.gmail.com',
        tls: {ciphers: 'SSLv3'},
     });

    const message = {
        text: data,
        from: 'felfelebugreport@gmail.com',
        to: 'bugreport@felfele.com',
        subject: 'Bug report: ' + dateString,
        attachment: [
            { data },
        ],
    };

    server.send(message, (err: any, msg: string) => console.log(err || msg));
};

const timestampToDateString = (timestamp: number, withTimezone: boolean = false): string => {
    const date = new Date(timestamp);
    if (withTimezone) {
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    }
    const prefix = (s: number, p: string) => ('' + p + s).substring(('' + s).length);
    const prefix2 = (s: number) => prefix(s, '00');
    const prefix3 = (s: number) => prefix(s, '000');
    const datePart = `${date.getUTCFullYear()}-${prefix2(date.getUTCMonth() + 1)}-${prefix2(date.getUTCDate())}`;
    const timePart = `${prefix2(date.getUTCHours())}:${prefix2(date.getUTCMinutes())}:${prefix2(date.getUTCSeconds())}.${prefix3(date.getUTCMilliseconds())}`;
    return `${datePart}T${timePart}Z`;
};
