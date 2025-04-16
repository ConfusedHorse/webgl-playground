export const fragmentShader = `
  uniform float u_canvasWidth;
  uniform float u_canvasHeight;
  uniform float u_opacity;
  varying vec3 v_worldPosition;

  void main() {
    float red = u_opacity * v_worldPosition.y / u_canvasHeight;
    float blue = u_opacity * v_worldPosition.x / u_canvasWidth;

    gl_FragColor = vec4(red, 0.0, blue, 1);
  }
`;