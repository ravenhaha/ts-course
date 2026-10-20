import { ApplicationController } from "./classes/ApplicationController.js";
import { setDecoratorLogging } from "./utils/decoratorLogging.js";
import { getErrorMessage } from "./utils/errors.js";

setDecoratorLogging(false);

const application: ApplicationController = new ApplicationController();
application.run().catch((error: unknown): void => {
  console.error(getErrorMessage(error));
  process.exitCode = 1;
}).finally((): void => {
  process.stdin.pause();
});
