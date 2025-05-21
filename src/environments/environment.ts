const current_url = window.location.origin;
export const environment = {
    production: false,
    api: { url: `${current_url}/api`, },
    enableDebug: false,
};
