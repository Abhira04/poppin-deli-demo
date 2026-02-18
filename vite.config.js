import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                menu: resolve(__dirname, 'menu.html'),
                visit: resolve(__dirname, 'visit.html'),
                order: resolve(__dirname, 'order.html'),
                reservations: resolve(__dirname, 'reservations.html'),
            },
        },
    },
});
