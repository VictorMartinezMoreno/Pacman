export default class ArcadeCRTWaterPipeline
extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {

    constructor(game) {
        super({
            game,
            renderTarget: true,
            fragShader: `
            precision mediump float;

            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;

            void main() {

                // Ondulación horizontal tipo agua / CRT
                float wave = sin(outTexCoord.y * 40.0 + outTexCoord.x * 5.0) * 0.002;
                vec2 uv = outTexCoord + vec2(wave, 0.0);

                // Color base
                vec4 color = texture2D(uMainSampler, uv);

                // Scanlines visibles
                float scan = sin(uv.y * 700.0) * 0.06;
                color.rgb -= scan;

                // Blur horizontal suave (fósforo)
                vec4 blur1 = texture2D(uMainSampler, uv + vec2(0.0015, 0.0));
                vec4 blur2 = texture2D(uMainSampler, uv - vec2(0.0015, 0.0));
                color = mix(color, (blur1 + blur2) * 0.9, 0.5);

                // Lavado de contraste tipo arcade viejo
                color.rgb = mix(color.rgb, vec3(0.5), 0.001);

                gl_FragColor = color;
            }
            `
        });
    }
}