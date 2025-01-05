import {useCallback, useEffect, useMemo, useState} from 'react';

export const useConfig = <Config>(
    overrides: Partial<Config> = {},
    builder: (configOverrides: Partial<Config>) => Config
): [Config, React.Dispatch<React.SetStateAction<Config>>, Config, () => void] => {
    const baseConfig = builder(overrides);
    const [config, setConfig] = useState(baseConfig);

    const serialisedOverrides = useMemo(() => JSON.stringify(overrides), [overrides]);

    useEffect(() => {
        const newConfig = builder(JSON.parse(serialisedOverrides));
        setConfig(newConfig);
    }, [serialisedOverrides, builder]);

    const reset = useCallback(() => {
        setConfig(baseConfig);
    }, [baseConfig]);

    return [config, setConfig, baseConfig, reset];
};
