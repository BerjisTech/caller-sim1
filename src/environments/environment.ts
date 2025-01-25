const current_url = window.location.origin;
export const environment = {
    production: true,
    api: { url: `${current_url}api`, },
    enableDebug: false,
};
