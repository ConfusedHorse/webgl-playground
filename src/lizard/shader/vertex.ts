export const vertexShader = `
  varying vec3 v_worldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    v_worldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;