
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';
import { visualizer } from "rollup-plugin-visualizer";
import { splitVendorChunkPlugin } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({

    root: './root',

    build: {
        sourcemap: 'inline',
        emptyOutDir: true,
        outDir: "../docs",
        minify: false,
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
            },
        },
    },

    server: {

        port: 1264,
        strictPort: true,
        https: true
    },

    plugins: [
        mkcert(),
        visualizer(),
    ],

    resolve: {
        alias: {
            $fonts: path.resolve(__dirname, 'root/src/modules/fonts'),
        }
    },

    css: {
        preprocessorOptions: {
            scss: {
                charset: false,
            }
        }
    }
});
