 
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';

 
 
// Max Parata for mountains
// https://maxparata.itch.io/rocky-mountains
// const list_asset_mtl = ["assets/maxparata_voxel_mountain/MountainRocks-0.mtl", 
// "assets/maxparata_voxel_mountain/MountainRocks-1.mtl",
// "assets/maxparata_voxel_mountain/MountainRocks-2.mtl",
// "assets/maxparata_voxel_mountain/MountainRocks-3.mtl",
// "assets/maxparata_voxel_mountain/MountainRocks-4.mtl",
// "assets/maxparata_voxel_mountain/MountainRocks-5.mtl",
// "assets/maxparata_voxel_mountain/MountainRocks-6.mtl",
// "assets/maxparata_voxel_mountain/MountainRocks-7.mtl",
// "assets/maxparata_voxel_mountain/MountainRocks-8.mtl",
//  "assets/maxparata_voxel_mountain/MountainRocks-9.mtl"]

// const list_asset_obj = ["assets/maxparata_voxel_mountain/MountainRocks-0.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-1.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-2.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-3.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-4.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-5.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-6.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-7.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-8.obj",
// "assets/maxparata_voxel_mountain/MountainRocks-9.obj"]
let audio_loader = new THREE.AudioLoader()
const bodies = []

 
const scene= new THREE.Scene(); 
const cam = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight,0.1,1000);;
cam.position.set(0,10,13); 
const renderer = new THREE.WebGLRenderer({antialias:true}); 
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

const orbitControls = new THREE.OrbitControls(cam, renderer.domElement)
orbitControls.enableDamping = true 
orbitControls.maxDistance=30
orbitControls.update()
//FOG
scene.fog = new THREE.Fog( 0xffffff, 100, 1000 );



const light1 = new THREE.HemisphereLight();
light1.position.set(-10,100,10);
light1.intensity =3.5
light1.castShadow = true
scene.add(light1);

//Mixamo
const fbx_loader = new THREE.FBXLoader()
let dynamicCollider
let controller;
function createCharacter(world){
    fbx_loader.load("assets/remy/Remy.fbx", (fbx)=>{
        fbx.traverse(model=>{
            if(model.isMesh) model.castShadow = true;
        }); 
        fbx.scale.set(0.01,0.01,0.01)
        scene.add(fbx)
        const mixer = new THREE.AnimationMixer(fbx)
        
        const animations = {}
        fbx_loader.load("assets/remy/Zombie_Idle.fbx", (anim)=>{

            const clip = anim.animations[0]
            const action = mixer.clipAction(clip)
            animations["idle"]  = action
        },function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },)
        fbx_loader.load("assets/remy/Walking.fbx", (anim)=>{
                
            const clip = anim.animations[0]
            const action = mixer.clipAction(clip);
            animations["walk"]  = action
        } )
        fbx_loader.load("assets/remy/Jumping.fbx", (anim)=>{
                
            const clip = anim.animations[0]
            const action = mixer.clipAction(clip);
            animations["jump"]  = action
        } )
        fbx_loader.load("assets/remy/Running.fbx", (anim)=>{
                
            const clip = anim.animations[0]
            const action =mixer.clipAction(clip);
            animations["run"] = action
            console.log(animations)
            
            let body = RAPIER.RigidBodyDesc.dynamic().setTranslation(-1,40,1)
            .setGravityScale(2)
            let rigidBody = world.createRigidBody(body) 
            dynamicCollider = RAPIER.ColliderDesc.cuboid(0.5, 0.2, 0.1) 
            world.createCollider(dynamicCollider, rigidBody)
            
            // let rayMap = 
            // {"y_minus": new RAPIER.Ray(
            //     { x: 0, y: 0, z: 0 },
            //     { x:0, y: -1, z: 0}
            // ),
            // "x_plus" :new RAPIER.Ray(
            //     { x: 1, y: 0, z: 0 },
            //     { x:1, y: 0, z: 0}
            // ),
            // "x_minus" :new RAPIER.Ray(
            //     { x: -1, y: 0, z: 0 },
            //     { x:-1, y: 0, z: 0}
            // ),
            // "z_plus" :new RAPIER.Ray(
            //     { x: 0, y: 0, z: 1 },
            //     { x:0, y: 0, z: 1}
            // ),
            // "z_minus" :new RAPIER.Ray(
            //     { x: 0, y: 0, z: -1 },
            //     { x:0, y: 0, z: -1}
            // )} 
            controller = new CharacterControl(
                fbx, 
                mixer, 
                animations, 
                orbitControls, 
                cam, 
                "idle", 
                rigidBody
            ) 
            
            
            document.addEventListener("keydown", (event)=>_handleKeyDown(event),false)
            document.addEventListener("keyup", (event)=>_handleKeyUp(event),false)
    
        } )
    })
        // let transform = new Ammo.btTransform()
        // transform.setIdentity()
        // transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
        // transform.setRotation(new Ammo.btQuaternion(0,0,0,1))
    
        // let motionState = new Ammo.btDefaultMotionState(transform)
        // let colShape = new Ammo.btBoxShape(new Ammo.btVector3(0.1,0.1,0.1))
        // colShape.setMargin(0.05)

        // let localInertia = new Ammo.btVector3(0,0,0)
        // colShape.calculateLocalInertia(mass,localInertia)
        
        // let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState,colShape, localInertia)
        // let body = new Ammo.btRigidBody(rbInfo)
        
        // body.setActivationState(STATE.DISABLE_DEACTIVATION)

        // physicsWorld.addRigidBody(body)
        // fbx.userData.physicsBody = body;
        // rigidBodies.push(fbx)
    
}
 
let moveDir ={
    forward:false,
    back:false,
    left:false,
    right:false,
    jump:false,
    run:false
}  
function _handleKeyDown(event){
        switch(event.code){
            case "KeyW":
                moveDir.forward = true
                break;
            case "KeyS":
                moveDir.back = true
                break;
            case "KeyA":
                moveDir.left = true
                break;
            case "KeyD":
                moveDir.right = true
                break;
            case "KeyC":
                moveDir.jump = true
                break;
        }
        if(event.code ==="ShiftLeft"){
            moveDir.run = true
            
        }
    }
function _handleKeyUp(event){
        switch(event.code){
            case "KeyW":
                moveDir.forward = false
                break;
            case "KeyS":
                moveDir.back =false
                break;
            case "KeyA":
                moveDir.left = false
                break;
            case "KeyD":
                moveDir.right = false
                break;
            case "KeyC":
                moveDir.jump = false
                break;
        }
        if( event.code ==="ShiftLeft"){
            moveDir.run = false
        }
    }
function draw_graphics(world){ 
    const mtl_loader = new THREE.MTLLoader();
    //0 means y = -17
    //num 3 means y = -11, creat bloc y = -30
    //num 4, 6 means y = -11, z+=7, y createBlock -17
    //8 means y = 0
    
    function drawBloc(num, world,graphX,graphY,graphZ, x,y,z,posx,posy,posz){
        mtl_loader.load("assets/maxparata_voxel_mountain/MountainRocks-"+num+".mtl",(mtl)=>{
            mtl.preload()
            const obj_loader = new THREE.OBJLoader();
            obj_loader.setMaterials(mtl)
            obj_loader.load("assets/maxparata_voxel_mountain/MountainRocks-"+num+".obj", (obj)=>{
                obj.position.y=graphY
                obj.position.z = graphZ
                obj.position.x = graphX
                
                
                createBlock(world,x,y,z,posx,posy,posz) 
                obj.scale.set(15,15,15)
                scene.add(obj)
            })
        })

    }

    //drawBloc(0,world,0,-17,0,60,60,100,0,-36,0) 
    //drawBloc(3,world,0,-11,0,60,60,90,0,-30,0)
    //drawBloc(4,world,0,-11,7,60,60,90,0,-17,0) 
    // drawBloc(6,world,0,-11,7,60,60,90,0,-17,0) 
    //drawBloc(8,world,0,0,0,60,60,100,0,-13,0) 
     
    let list =[0, 0, 4, 4, 6, 6, 0, 6, 3, 0, 4, 6, 6, 0, 0, 0, 0, 3, 3, 6, 0, 0, 4, 0, 3, 4, 6, 0, 0, 4, 6, 4, 6, 0, 4, 3, 4, 4, 4, 4, 3, 0, 3, 3, 0, 0, 4, 3, 4, 3, 6, 3, 4, 0, 4, 3, 4, 3, 3, 3, 6, 6, 4, 3, 6, 3, 0, 3, 6, 4, 3, 3, 6, 4, 3, 4, 3, 6, 0, 4, 0, 6, 3, 6, 0, 6, 6, 0, 0, 4, 4, 0, 6, 4, 4, 4, 3, 3, 0, 4, 6, 6, 0, 4, 0, 0, 3, 4, 4, 3, 4, 3, 3, 6, 3, 6, 0, 6, 3, 0, 0, 4, 3, 4, 4, 4, 3, 4, 4, 6, 0, 4, 4, 6, 6, 3, 3, 4, 6, 4, 3, 3, 6, 6, 6, 3, 3, 3, 0, 6, 3, 3, 0, 0, 0, 6, 4, 0, 0, 3, 6, 6, 3, 4, 3, 3, 3, 4, 4, 3, 4, 6, 6, 4, 6, 3, 6, 3, 0, 3, 4, 0, 0, 6, 3, 3, 3, 3, 0, 3, 0, 3, 4, 3, 4, 3, 3, 0, 4, 0, 3, 4, 4, 4, 3, 4, 4, 0, 0, 0, 4, 0, 0, 6, 0, 3, 6, 6, 6, 0, 3, 4, 6, 6, 0, 0, 3, 0, 4, 6, 0, 3, 3, 0, 6, 6, 4, 4, 6, 4]
    let list_i = 0
    let len_x = 400
    let len_y = 400
    for(let i=-len_x;i<len_x;i+=60){  
        for(let j=-len_y;j<len_y;j+=70){
            let random = list[list_i]
                switch(random){
                    case 0:
                        drawBloc(0,world,i,-17,j,60,60,100,i,-36,j) 
                        break;
                    case 3:
                        drawBloc(3,world,i,-11,j,60,60,90,i,-30,j)
                        break;
                    case 4:
                        drawBloc(4,world,i,-11,j+7,60,60,90,i,-17,j) 
                        break;
                    case 6:
                        drawBloc(6,world,i,-11,j+7,60,60,90,i,-17,j) 
                        break;
                    case 8:
                        drawBloc(8,world,i,0,j,60,60,100,i,-13,j) 
                        break;
                }         
            list_i+=1
            if(list_i>=list.length){
                list_i = 0
            }
        
        } 
    }

}


let animation1;
let animation2;
let animation3;
let animation4;
let mixer1;
let mixer2;
let mixer3;
let mixer4;
const gltf_loader = new THREE.GLTFLoader();

function structures(world){

    // Rumah pohon ada creeper
    //import sketchfab from "Neighborhood House" (https://skfb.ly/ozuFt) 
    //by Home Design 3D is licensed under CC Attribution-NonCommercial-ShareAlike (http://creativecommons.org/licenses/by-nc-sa/4.0/).
    let pos_crephouse_x=-160
    let pos_crephouse_y = 15
    let pos_crephouse_z = 20
     Firehouse( pos_crephouse_x, pos_crephouse_y, pos_crephouse_z);
     Firehouse( pos_crephouse_x-111, pos_crephouse_y, pos_crephouse_z+100); 


    //Bangunan bata 
    //This work is based on "brick-cottage" (https://sketchfab.com/3d-models/brick-cottage-f9c1a9134def478699d1c744fe46a371) by madexc (https://sketchfab.com/madexc) 
    //licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
    gltf_loader.load("./assets/building1/scene.gltf", function(res){
        console.log(res);
        let pos_x =200
        let pos_y = 9
        let pos_z = 50
        res.scene.position.set(pos_x,pos_y,pos_z)
        // res.scene.rotation.set(0,3.1,0)
        res.scene.scale.set(100,100,100)
        createBlock(world,175,10,175,pos_x,pos_y,pos_z,0x505c44,false) 
        createBlock(world,95,2,125,pos_x+15,pos_y+8,pos_z) 
        createBlock(world,95,2,125,pos_x+15,pos_y+30,pos_z) 
        createBlock(world,95,2,125,pos_x+15,pos_y+52,pos_z) 
        //"Minecraft Villager (Animatable)" (https://skfb.ly/6UF68) by BlazingWildFire is licensed under Creative 
        //Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
        gltf_loader.load("./assets/villager/fixedvillager.gltf", function(result){
            console.log(result);
            result.scene.position.set(pos_x-60,pos_y+7,pos_z)
            animation4 = result.animations
            mixer4 = new THREE.AnimationMixer(result.scene);
            //animations movement
            let action4 = mixer4.clipAction(animation4[0]);
            action4.play();
            scene.add(result.scene);
        });
        scene.add(res.scene);
    });


    // Rumah ada cerobong asap
    //This work is based on "mini-house" (https://sketchfab.com/3d-models/mini-house-0b8116dd7453429ebb9af9f1a29451fb) by madexc (https://sketchfab.com/madexc) 
    //licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
    gltf_loader.load("./assets/h2/scene.gltf", function(res){
        console.log(res);
        let pos_x=50
        let pos_y = 10
        
        let pos_z =100
        res.scene.position.set(pos_x,pos_y,pos_z) 
        res.scene.scale.set(50,50,50) 
        scene.add(res.scene);
        createBlock(world,50,2,50,pos_x+13,pos_y+5,pos_z+23)  
    });
    
    

    //Ghast
    //This work is based on "HD Ghast [ Minecraft Bedrock Edition ]" (https://sketchfab.com/3d-models/hd-ghast-minecraft-bedrock-edition-4a3c8e65815246cfa3c4de56bb0ef3b3) by ArtsByKev (https://sketchfab.com/ArtsByKev) 
    //licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
    gltf_loader.load("./assets/ghast/scene.gltf", function(result){
        console.log(result);
        result.scene.position.set(-100,60,100)
        result.scene.scale.set(20,20,20)
        result.scene.rotation.set(0,3.5,0)
        animation3 = result.animations
        mixer3 = new THREE.AnimationMixer(result.scene);
        //animations movement
        let action3 = mixer3.clipAction(animation3[3]);
        action3.play();
        scene.add(result.scene);
    });

    // //"Minecraft Villager (Animatable)" (https://skfb.ly/6UF68) by BlazingWildFire is licensed under Creative 
    // //Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
    // gltf_loader.load("./assets/villager/villager.gltf", function(result){
    //     console.log(result);
    //     result.scene.position.set(-48,10,10)
    //     animation4 = result.animations
    //     mixer4 = new THREE.AnimationMixer(result.scene);
    //     //animations movement
    //     let action4 = mixer4.clipAction(animation4[0]);
    //     action4.play();
    //     scene.add(result.scene);
    // });




    function Firehouse(pos_crephouse_x, pos_crephouse_y, pos_crephouse_z) {
        gltf_loader.load("./assets/h1/scene.gltf", function (res) {
            console.log(res);
            let pos_x = pos_crephouse_x;
            let pos_y = pos_crephouse_y;
            let pos_z = pos_crephouse_z;
            res.scene.position.set(pos_x, pos_y, pos_z);
            res.scene.scale.set(3, 3, 3);
            scene.add(res.scene);
        });
        gltf_loader.load("./assets/creeper/scene.gltf", function (result) {
            console.log(result);
            result.scene.position.set(pos_crephouse_x - 20, pos_crephouse_y - 5, pos_crephouse_z - 20);
            result.scene.scale.set(3, 3, 3);
            result.scene.rotation.set(0, 1.5, 0);
            animation1 = result.animations;
            mixer1 = new THREE.AnimationMixer(result.scene);
            //animations movement
            let action1 = mixer1.clipAction(animation1[1]);
            action1.play();
            scene.add(result.scene);
        });

        //Pohon
        //This work is based on "Low Poly Tree 1" (https://sketchfab.com/3d-models/low-poly-tree-1-3fcf07ff3e0d4b989cc7d2dca38851c3) by ayushYadav31 
        //(https://sketchfab.com/ayushYadav31) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
        gltf_loader.load("./assets/t1/scene.gltf", function (result) {
            console.log(result);
            result.scene.position.set(pos_crephouse_x - 20, pos_crephouse_y, pos_crephouse_z + 20);
            result.scene.scale.set(3, 3, 3);
            scene.add(result.scene);
        });
        //Pohon
        gltf_loader.load("./assets/t1/scene.gltf", function (result) {
            console.log(result);
            result.scene.position.set(pos_crephouse_x + 20, pos_crephouse_y, pos_crephouse_z + 20);
            result.scene.scale.set(3, 3, 3);
            scene.add(result.scene);
        });
        //Api unggun belakang rumah
        //This work is based on "Animated fire" (https://sketchfab.com/3d-models/animated-fire-ebb16a3df22247dd990a04585de64741) 
        //by Yannick Deharo (https://sketchfab.com/YannickDeharo) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
        gltf_loader.load("./assets/fireplace/scene.gltf", function (result) {
            console.log(result);
            let pos_x = pos_crephouse_x;
            let pos_y = pos_crephouse_y;
            let pos_z = pos_crephouse_z - 30;
            result.scene.position.set(pos_x, pos_y, pos_z);
            result.scene.scale.set(10, 10, 10);
            animation2 = result.animations;
            mixer2 = new THREE.AnimationMixer(result.scene);
            //animations movement
            let action2 = mixer2.clipAction(animation2[0]);
            action2.play();
            scene.add(result.scene);
        }); 
    }
}


function createBlock(world,x,y,z, posx,posy,posz,color, isWireframe){
    if(color==null) color = 0x777777
    if(isWireframe==null) isWireframe=true
    let geo = new THREE.BoxGeometry(x,y,z);
    let mat1 = new THREE.MeshBasicMaterial({color:color, wireframe:isWireframe});
    let cube = new THREE.Mesh(geo,mat1);  
    cube.position.set(posx,posy,posz)
    scene.add(cube);

    const bodyType = RAPIER.RigidBodyDesc.fixed().setTranslation(posx,posy,posz)    
    const rigidBody = world.createRigidBody(bodyType);
     
    const colliderType = RAPIER.ColliderDesc.cuboid(x/2, y/2, z/2).setTranslation(posx,posy,posz)
    world.createCollider(colliderType,rigidBody.handle)
    let map = {rigid:rigidBody,mesh:cube,collider:colliderType}
    bodies.push(map)
} 
moveDir = {left:0,right:0,forward:0,back:0, jump:0} //left, right, forward, back 
 
window.addEventListener('resize',function(){
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    cam.aspect = width / height;
    cam.updateProjectionMatrix();
});

 
let pendengar = new THREE.AudioListener();
cam.add(pendengar);
let sound1 = new THREE.Audio(pendengar);
let loader =audio_loader.load('assets/soundtrack.ogg', (hasil)=>{
        sound1.setBuffer(hasil);
        sound1.setLoop( true );
        sound1.play();
    });
const clock = new THREE.Clock() 
RAPIER.init().then(()=>{
    let gravity = {x:0.0, y:-9.8, z:0.0};
    let world = new RAPIER.World(gravity);
    structures(world)
    draw_graphics(world) 

    createCharacter(world) 
    let isColliding = false;
    function gameLoop(){
        let delta= clock.getDelta()
        let event = new RAPIER.EventQueue(true)
        world.step(event) 
        bodies.forEach((body)=>{
            let pos = body.rigid.translation()
            let rot = body.rigid.rotation()
            body.mesh.position.x = pos.x
            body.mesh.position.y = pos.y
            body.mesh.position.z = pos.z
            // world.contactsWith(body.collider, (dynamicCollider)=>{
            //     console.log("COlliding")
            //     Object.keys(moveDir).forEach((e)=>{
            //         moveDir.e = false
            //     }

            //     )
            // })
            body.mesh.setRotationFromQuaternion(
                new THREE.Quaternion(rot.x,rot.y, rot.z, rot.w))
        })
        if(controller)controller.update(world,delta,moveDir,isColliding)
        if(mixer1){
            mixer1.update(delta);
        }
        if(mixer2){
            mixer2.update(delta);
        }
        if(mixer3){
            mixer3.update(delta);
        }
        if(mixer4){
            mixer4.update(delta);
        }
        orbitControls.update()
        renderer.render(scene,cam);
        setTimeout(gameLoop,16)
    }
    gameLoop()
    
})