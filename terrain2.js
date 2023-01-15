
let cell_size=768
const scene = new THREE.Scene();
scene.background = new THREE.Color("lightblue")
const cam = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight,1,1000);
cam.position.set(0, cell_size*0.4, cell_size*0.4);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement)

const controls = new THREE.OrbitControls(cam, renderer.domElement)
controls.update()

window.addEventListener("resize",(e)=>{
    cam.aspect = window.innerWidth/window.innerHeight
    cam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
})

const light1 = new THREE.HemisphereLight();
light1.intensity = 2.5
light1.position.set(-10,10,10);
scene.add(light1);

const loader = new THREE.GLTFLoader();
loader.load("asset/dwarven_gate/scene.gltf",
// called when the resource is loaded
    function ( gltf ) {
        gltf.scene.position.set(0,0,0)
        scene.add( gltf.scene );
        
    }
)



function draw() {
    requestAnimationFrame(draw);
    

    renderer.render(scene,cam);
}

draw()