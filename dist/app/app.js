"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const errorHandler_1 = __importDefault(require("../middleware/errorHandler/errorHandler"));
const customError_1 = __importDefault(require("../utils/lib/customError"));
const constants_1 = require("../utils/miscellaneous/constants");
const userModelTypes_1 = require("../utils/modelTypes/user/userModelTypes");
const database_1 = require("./database");
const router_1 = __importDefault(require("./router"));
const socket_1 = require("./socket");
const workers_1 = __importDefault(require("../utils/workers"));
class App {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.origin = constants_1.origin;
        this.server = (0, socket_1.SocketServer)(this.app);
        this.port = port;
        this.initMiddleware();
        this.initRouters();
        this.socket();
        this.runCron();
        this.notFoundRouter();
        this.errorHandle();
        this.disableXPoweredBy();
        this.workers = new workers_1.default();
    }
    // Run cron jobs
    runCron() {
        return __awaiter(this, void 0, void 0, function* () {
            // Run every 3 days at 12:00 AM
            // cron.schedule('0 0 */3 * *', async () => {
            //   // await services.getSabreToken();
            // });
        });
    }
    //start server
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.listen(this.port, () => {
                console.log(`Tovozo server has started successfully at port: ${this.port}...🚀`);
            });
        });
    }
    //init middleware
    initMiddleware() {
        this.app.use(express_1.default.json({ limit: "2mb" }));
        this.app.use(express_1.default.urlencoded({ limit: "2mb", extended: true }));
        this.app.use((0, morgan_1.default)("dev"));
        this.app.use((0, cors_1.default)({ origin: this.origin, credentials: true }));
    }
    // socket connection
    socket() {
        socket_1.io.use((socket, next) => {
            var _a;
            if (!((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.id)) {
                next(new Error("Provide id into auth."));
            }
            else {
                next();
            }
        });
        socket_1.io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
            const { id, type } = socket.handshake.auth;
            console.log({ id, type });
            if (id && type) {
                (0, socket_1.addOnlineUser)(id, socket.id, type);
            }
            console.log("Socket Connected");
            let lastLocation = {};
            if (type === userModelTypes_1.TypeUser.JOB_SEEKER) {
                socket.join(String(id));
                socket.on("send-location", (data) => {
                    console.log("send-location", data);
                    socket_1.io.to(`watch:jobseeker:${id}`).emit("receive-location", data);
                    lastLocation = data;
                });
            }
            if (type === userModelTypes_1.TypeUser.HOTELIER) {
                socket.on("hotelier:watch", ({ jobSeekerId }) => {
                    socket.join(`watch:jobseeker:${jobSeekerId}`);
                });
                socket.on("hotelier:location-start", ({ jobSeekerId }) => {
                    socket
                        .to(jobSeekerId)
                        .emit(`jobseeker:location-start-${jobSeekerId}`);
                });
                socket.on("hotelier:location-stop", ({ jobSeekerId }) => {
                    socket
                        .to(jobSeekerId)
                        .emit(`jobseeker:location-stop-${jobSeekerId}`);
                });
                socket.join(String(id));
            }
            socket.on("disconnect", (event) => __awaiter(this, void 0, void 0, function* () {
                console.log(socket.id, "-", id, "-", type, " disconnected...");
                yield (0, socket_1.removeOnlineUser)(id, socket.id);
                if (type === userModelTypes_1.TypeUser.JOB_SEEKER &&
                    lastLocation.latitude &&
                    lastLocation.longitude) {
                    console.log({ lastLocation });
                    const getLocation = yield (0, database_1.db)("job_seeker")
                        .withSchema("jobseeker")
                        .select("location_id")
                        .where({ user_id: id })
                        .first();
                    console.log({ getLocation });
                    if (getLocation) {
                        yield (0, database_1.db)("location")
                            .withSchema("dbo")
                            .update({
                            latitude: lastLocation.latitude,
                            longitude: lastLocation.longitude,
                        })
                            .where({ id: getLocation === null || getLocation === void 0 ? void 0 : getLocation.location_id });
                    }
                    console.log({ getLocation });
                }
                socket.disconnect();
            }));
        }));
    }
    // init routers
    initRouters() {
        this.app.get("/", (_req, res) => {
            res.send(`Tovozo server is running successfully..🚀`);
        });
        this.app.get("/api", (_req, res) => {
            res.send(`Tovozo API is active...🚀`);
        });
        this.app.use("/api/v1", new router_1.default().Router);
    }
    // not found router
    notFoundRouter() {
        this.app.use("*", (_req, _res, next) => {
            next(new customError_1.default("Cannot found the route", 404));
        });
    }
    // error handler
    errorHandle() {
        this.app.use(new errorHandler_1.default().handleErrors);
    }
    //disable x-powered-by
    disableXPoweredBy() {
        this.app.disable("x-powered-by");
    }
}
exports.default = App;
