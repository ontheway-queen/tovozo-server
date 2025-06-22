import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { Server } from "http";
import morgan from "morgan";
import ErrorHandler from "../middleware/errorHandler/errorHandler";
import Models from "../models/rootModel";
import CustomError from "../utils/lib/customError";
import { origin } from "../utils/miscellaneous/constants";
import RootRouter from "./router";
import { SocketServer, io } from "./socket";

class App {
  public app: Application = express();
  private server: Server;
  private port: number;
  private origin: string[] = origin;

  constructor(port: number) {
    this.server = SocketServer(this.app);
    this.port = port;
    this.initMiddleware();
    this.initRouters();
    this.socket();
    this.runCron();
    this.notFoundRouter();
    this.errorHandle();
    this.disableXPoweredBy();
  }

  // Run cron jobs
  private async runCron() {
    // Run every 3 days at 12:00 AM
    // cron.schedule('0 0 */3 * *', async () => {
    //   // await services.getSabreToken();
    // });
  }

  //start server
  public async startServer() {
    this.server.listen(this.port, () => {
      console.log(
        `Tovozo server has started successfully at port: ${this.port}...🚀`
      );
    });
  }

  //init middleware
  private initMiddleware() {
    this.app.use(express.json({ limit: "2mb" }));
    this.app.use(express.urlencoded({ limit: "2mb", extended: true }));
    this.app.use(morgan("dev"));
    this.app.use(cors({ origin: this.origin, credentials: true }));
  }

  // socket connection
  private socket() {
    io.use((socket, next) => {
      if (!socket.handshake.auth?.id) {
        next(new Error("Provide id into auth."));
      } else {
        next();
      }
    });

    io.on("connection", async (socket) => {
      const { id, type } = socket.handshake.auth;
      console.log(socket.id, "-", id, "-", type, " is connected ⚡");
      if (id && type) {
        const model = new Models().UserModel();
        await model.updateProfile({ socket_id: socket.id }, id);
      }
      socket.on("disconnect", async (event) => {
        console.log(socket.id, "-", id, "-", type, " disconnected...");
        socket.disconnect();
      });
    });
  }

  // init routers
  private initRouters() {
    this.app.get("/", (_req: Request, res: Response) => {
      res.send(`Tovozo server is running successfully...🚀`);
    });

    this.app.get("/api", (_req: Request, res: Response) => {
      res.send(`Tovozo API is active...🚀`);
    });

    this.app.use("/api/v1", new RootRouter().v2Router);
  }

  // not found router
  private notFoundRouter() {
    this.app.use("*", (_req: Request, _res: Response, next: NextFunction) => {
      next(new CustomError("Cannot found the route", 404));
    });
  }

  // error handler
  private errorHandle() {
    this.app.use(new ErrorHandler().handleErrors);
  }

  //disable x-powered-by
  private disableXPoweredBy() {
    this.app.disable("x-powered-by");
  }
}

export default App;
