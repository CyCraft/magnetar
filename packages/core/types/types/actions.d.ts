export declare type plainObject = {
    [key: string]: any;
};
export declare type ActionName = 'insert' | 'merge' | 'assign' | 'get' | 'stream';
export declare type ActionType = 'write' | 'read';
export declare const actionNameTypeMap: {
    [action in ActionName]: ActionType;
};
export declare type EventName = 'before' | 'success' | 'error';
export declare type EventFn = <T extends plainObject>(args: {
    payload: T;
    abort: () => void;
    error?: any;
}) => Partial<T> | Promise<Partial<T>>;
export interface ActionConfig {
    on?: {
        [storeName: string]: {
            [key in EventName]?: EventFn;
        } & {
            aborted?: <T extends plainObject>(args: {
                payload: T;
                error?: any;
            } & {
                at: EventName;
            }) => Partial<T> | Promise<Partial<T>>;
        };
    };
}
export declare type PluginAction = <T extends plainObject>(payload: T, actionConfig?: ActionConfig) => Promise<Partial<T>>;
