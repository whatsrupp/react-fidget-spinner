import classes from './Text.module.css';

export const Text = ({children}: {children: React.ReactNode}) => {
    return <div className={classes.text}>{children}</div>;
};
