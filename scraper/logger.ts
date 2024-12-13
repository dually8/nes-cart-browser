export class Logger {
	private static instance: Logger;
	private logLevel: LogLevel;

	private constructor(logLevel: LogLevel = LogLevel.INFO) {
		this.logLevel = logLevel;
	}

	public static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	public setLogLevel(logLevel: LogLevel): void {
		this.logLevel = logLevel;
	}

	public info(message: string, ...args: unknown[]): void {
		if (this.logLevel <= LogLevel.INFO) {
			console.log(`[INFO] ${message}`, args);
		}
	}

	public warn(message: string, ...args: unknown[]): void {
		if (this.logLevel <= LogLevel.WARN) {
			console.warn(`[WARN] ${message}`, args);
		}
	}

	public error(message: string, ...args: unknown[]): void {
		if (this.logLevel <= LogLevel.ERROR) {
			console.error(`[ERROR] ${message}`, args);
		}
	}
}

export enum LogLevel {
	INFO,
	WARN,
	ERROR,
}
