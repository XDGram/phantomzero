import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

function GlassCube() {
  const cube = useRef<THREE.Mesh>(null)
  const target = useRef(new THREE.Vector3(0, 0, 0))
  const dragOffset = useRef(new THREE.Vector3())
  const dragging = useRef(false)
  const [hovered, setHovered] = useState(false)

  const dragPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    [],
  )
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.58, 1.58, 1.58)),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (!cube.current) return

    const mesh = cube.current
    const t = clock.getElapsedTime()

    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, target.current.x, 0.1)
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, target.current.y, 0.1)
    mesh.position.z = THREE.MathUtils.lerp(
      mesh.position.z,
      Math.sin(t * 1.15) * 0.08,
      0.07,
    )

    const targetRotationX =
      0.34 + pointer.y * 0.24 + Math.sin(t * 0.45) * 0.035
    const targetRotationY =
      0.48 + pointer.x * 0.34 + Math.cos(t * 0.35) * 0.045

    mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRotationX, 0.055)
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotationY, 0.055)

    const targetScale = hovered ? 1.035 : 1
    const nextScale = THREE.MathUtils.lerp(mesh.scale.x, targetScale, 0.08)
    mesh.scale.setScalar(nextScale)
  })

  const pointOnPlane = (event: ThreeEvent<PointerEvent>) => {
    const hit = new THREE.Vector3()
    return event.ray.intersectPlane(dragPlane, hit) ? hit : null
  }

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const hit = pointOnPlane(event)
    if (!hit || !cube.current) return

    dragging.current = true
    dragOffset.current.copy(cube.current.position).sub(hit)
    const pointerTarget = event.nativeEvent.target as HTMLElement | null
    pointerTarget?.setPointerCapture(event.pointerId)
    document.body.style.cursor = 'grabbing'
  }

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return
    event.stopPropagation()

    const hit = pointOnPlane(event)
    if (!hit) return

    hit.add(dragOffset.current)
    target.current.set(
      THREE.MathUtils.clamp(hit.x, -2.65, 2.65),
      THREE.MathUtils.clamp(hit.y, -1.7, 1.7),
      0,
    )
  }

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    dragging.current = false
    const pointerTarget = event.nativeEvent.target as HTMLElement | null
    pointerTarget?.releasePointerCapture(event.pointerId)
    document.body.style.cursor = hovered ? 'grab' : 'default'
  }

  return (
    <mesh
      ref={cube}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
        if (!dragging.current) document.body.style.cursor = 'grab'
      }}
      onPointerOut={() => {
        setHovered(false)
        if (!dragging.current) document.body.style.cursor = 'default'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      rotation={[0.34, 0.48, 0]}
    >
      <boxGeometry args={[1.58, 1.58, 1.58]} />
      <meshPhysicalMaterial
        color="#f3f9ff"
        roughness={0.08}
        metalness={0}
        transmission={0.94}
        thickness={0.68}
        ior={1.46}
        transparent
        opacity={0.72}
        clearcoat={1}
        clearcoatRoughness={0.08}
        specularIntensity={1}
      />
      <lineSegments geometry={edges} scale={1.003}>
        <lineBasicMaterial color="#7894a8" transparent opacity={0.16} />
      </lineSegments>
    </mesh>
  )
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 36 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[4, 5, 6]} intensity={2.6} />
      <pointLight position={[-4, -1, 3]} intensity={16} distance={8} />
      <pointLight position={[2.5, -3, 2]} intensity={8} distance={7} />
      <GlassCube />
    </Canvas>
  )
}

function App() {
  return (
    <div className="app-shell">
      <nav className="top-nav" aria-label="Primary">
        <a className="brand" href="#" aria-label="Phantomzero home">
          <span className="brand-mark" />
          <span>phantomzero</span>
        </a>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#object">Object</a>
        </div>

        <span className="nav-action" aria-hidden="true">
          00
        </span>
      </nav>

      <main className="stage" id="object" aria-label="Interactive glass cube">
        <div className="light-field light-field-a" />
        <div className="light-field light-field-b" />
        <Scene />
        <div className="interaction-note" aria-hidden="true">
          drag to move · cursor to tilt
        </div>
      </main>
    </div>
  )
}

export default App
