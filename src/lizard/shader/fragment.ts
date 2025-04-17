export const fragmentShader = `
  uniform float u_canvasWidth;
  uniform float u_canvasHeight;
  uniform float u_opacity;
  varying vec3 v_worldPosition;

  void main() {
    float green = u_opacity * v_worldPosition.y / u_canvasHeight;
    float blue = u_opacity * v_worldPosition.x / u_canvasWidth;

    gl_FragColor = vec4(0.0, green, blue, 1);
  }
`;