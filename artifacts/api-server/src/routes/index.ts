import { Router, type IRouter } from "express";
import healthRouter from "./health";
import marloweRouter from "./marlowe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(marloweRouter);

export default router;
