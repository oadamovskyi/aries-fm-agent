import { Request, Response, Router } from 'express';
import {app,faber,alice} from './../index';

const router = Router();
router
    .route('/')
    .get((req: Request, res: Response) => {
        // faber.credentials.getAll().then(credentials => {
        //     res.send({"Credentials" : credentials})
        // })
        
        res.send('Hello world!')
    })

export default router;
