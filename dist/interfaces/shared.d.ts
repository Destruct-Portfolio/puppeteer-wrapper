export type AsyncMethod<InputT, OutputT> = (config: InputT) => Promise<OutputT>;
