
//three.js Basic Character Controls - GLTFLoader, AnimationMixer, 3rd Person Controller by Genka
//https://www.youtube.com/watch?v=C3s0UHpwlf8

//three.js & rapier3D - Character Terrain Movement
//https://www.youtube.com/watch?v=voGmsOuB3Rk&t=0s
class CharacterControl{
    constructor(model, mixer, animationMap, orbitControl, camera, currentAction ,  rigidBody){
        this.toogleRun = false

        this.model = model
        this.mixer = mixer
        this.animationMap = animationMap
        this.orbitControl = orbitControl
        this.camera = camera
        this.currentAction = currentAction
        this.animationMap[currentAction].play()

        this.walkDir = new THREE.Vector3()
        this.rotateAngle = new THREE.Vector3(0,1,0)
        this.rotateQuarternion = new THREE.Quaternion()
        this.cameraTarget = new THREE.Vector3()

        this.fadeDuration = 0.2
        this.runVelocity = 15
        this.walkVelocity = 5
        
        this.storedFall = 0 
        this.rigidBody = rigidBody
        this.mass=1   
    }
    lerp(x,y,a){
        return x * (1 - a ) + y * a
    } 

    update(world,delta, keysPressed, isColliding){ 
        const prevPos = this.model.position
        const directionPressed =keysPressed.forward || keysPressed.back || keysPressed.left|| keysPressed.right
        console.log(directionPressed)
        let play = ""
        if(keysPressed.run && directionPressed){play = "run"}
        else if(keysPressed.jump ){play = "jump"}
        else if(directionPressed){play="walk"}
        else{play="idle"}
        if( this.currentAction !=play){
            const toPlay = this.animationMap[play]
            const current = this.animationMap[this.currentAction]
            
            current.fadeOut(this.fadeDuration)
            toPlay.reset().fadeIn(this.fadeDuration).play();
            this.currentAction = play;
        }

        this.mixer.update(delta)


        this.walkDir.x = this.walkDir.y = this.walkDir.z = 0

        let vel = 0
        if(this.currentAction == "run" || this.currentAction == "walk"){
            var yCamDir = Math.atan2(
                (this.camera.position.x - this.model.position.x), 
                (this.camera.position.z - this.model.position.z)
            )
            const charOffset = this.charOffset(keysPressed)
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, yCamDir + charOffset)
            this.model.quaternion.rotateTowards(this.rotateQuarternion,0.2)

            this.camera.getWorldDirection(this.walkDir)
            this.walkDir.y = 0
            this.walkDir.normalize()
            this.walkDir.applyAxisAngle(this.rotateAngle, charOffset)
            vel = this.currentAction == "run" ? this.runVelocity : this.walkVelocity
     
        }
        const translation = this.rigidBody.translation()
        if(translation.y<-120){
            this.rigidBody.setTranslation({x:0, y:20, z:0})
            this.model.position.y = 40
        }else{
            const camPosOffset = this.camera.position.sub(this.model.position)
            this.model.position.set(translation.x, translation.y, translation.z)
            this.updateCameraTarget(camPosOffset.x, camPosOffset.z, camPosOffset.z)
            
            //this.walkDir.y += this.lerp(this.storedFall, -9.81 * delta, 0.1)  //Gravitasi
            
            this.storedFall = this.walkDir.y
            this.storedX = this.walkDir.x
            this.storedZ = this.walkDir.z

            // this.rays["down"].origin.x = translation.x 
            // this.rays["down"].origin.y =translation.y
            // this.rays["down"].origin.z =translation.z

            // Object.keys(this.rays).forEach((key)=>{
                 
            //     this.rays[key].origin.x = translation.x 
            //     this.rays[key].origin.y =translation.y
            //     this.rays[key].origin.z =translation.z
            //     const geo = new THREE.BoxGeometry();
            //     const mat1 = new THREE.MeshBasicMaterial({color:0xff0000});
            //     const cube = new THREE.Mesh(geo,mat1);  
            //     cube.position.set(
            //         this.rays[key].dir.x + this.rays[key].origin.x ,
            //         this.rays[key].dir.y+ this.rays[key].origin.y,
            //         this.rays[key].dir.z + this.rays[key].origin.z )
            //     this.scene.add(cube);
            // })

            // let hit_y_minus = world.castRay(this.rays["y_minus"], 0.5, false,0xffffffff );
            // let hit_x_plus = world.castRay(this.rays["x_plus"], 0.5, false,0xffffffff );
            // let hit_x_minus = world.castRay(this.rays["x_minus"], 0.5, false,0xffffffff );
            // let hit_z_plus = world.castRay(this.rays["z_plus"], 0.5, false,0xffffffff );
            // let hit_z_minus = world.castRay(this.rays["z_minus"], 0.5, false,0xffffffff ); 
            // let diff_min = 5
            // if(hit_y_minus){
            //     const point =this.rays["y_minus"].pointAt(hit_y_minus.toi)
                
            //     let diff = translation.y - (point.y + 0.28) //CONTROLLER BODY RADIUS
            //     if(diff<diff_min){ 
            //         this.storedFall = 0
            //         this.walkDir.y = this.lerp(0,Math.abs(diff), 0.05)
            //     } 
            // }


            // if(hit_x_minus){
            //     console.log("Print x minus")
            //     const point =this.rays["x_minus"].pointAt(hit_x_minus.toi)
            //     let diff =  translation.x -(point.x + 0.28)//CONTROLLER BODY RADIUS
            //     if(diff<5){   
            //         this.walkDir.x =-this.lerp(1,Math.abs(diff), 0.5)
            //     }  
            //     else{
            //         console.log("Ga colide")
            //         this.walkDir.x = this.walkDir.x * vel * delta
            //     }
            // }  
            // if(hit_x_plus){
            //     console.log("Print x plus")
            //     const point =this.rays["x_plus"].pointAt(hit_x_plus.toi)
            //     let diff =  translation.x +(point.x + 0.28)//CONTROLLER BODY RADIUS
            //     if(diff<5){   
            //         this.walkDir.x = this.lerp(1,Math.abs(diff), 0.5)
            //     }  
            //     else{
            //         console.log("Ga colide")
            //         this.walkDir.x = this.walkDir.x * vel * delta
            //     }
            // } 


            // if(hit_z_minus){
            //     console.log("Print z minus")
            //     const point =this.rays["z_minus"].pointAt(hit_z_minus.toi)
            //     let diff =  translation.z -(point.z + 0.28)//CONTROLLER BODY RADIUS
            //     if(diff<5){   
            //         this.walkDir.z =-this.lerp(1,Math.abs(diff), 0.5)
            //     }  
            //     else{
            //         console.log("Ga colide")
            //         this.walkDir.x = this.walkDir.x * vel * delta
            //     }
            // } 
            // if(hit_z_plus){
            //     console.log("Print z plus")
            //     const point =this.rays["z_plus"].pointAt(hit_z_plus.toi)
            //     let diff =  translation.z +(point.z + 0.28)//CONTROLLER BODY RADIUS
            //     if(diff<5){   
            //         this.walkDir.z = this.lerp(1,Math.abs(diff), 0.5)
            //     }  
            //     else{
            //         console.log("Ga colide") 
            //         this.walkDir.z = this.walkDir.z * vel * delta
            //     }
            // } 
            // if(hit_z_minus){
            //     console.log("Print z minus")
            //     const point =this.rays["z_minus"].pointAt(hit_z_minus.toi)
            //     let diff =  translation.z -(point.z + 0.28)//CONTROLLER BODY RADIUS
            //     if(diff<5){  
            //         this.storedX = 1
                    
            //         this.walkDir.z = this.lerp(1,Math.abs(diff), 0.5)
            //     }  
            // } 
            // else{
            //     console.log("Ga colide")
            //     this.walkDir.z = this.walkDir.z* vel * delta
            // }
            if(keysPressed.jump){
                this.walkDir.y+=5
            } 
            this.walkDir.z = this.walkDir.z* vel * delta
            this.walkDir.x = this.walkDir.x * vel * delta
            if(!isColliding){
                this.rigidBody.setTranslation({
                    x: translation.x - this.walkDir.x,
                    y: translation.y + this.walkDir.y,
                    z: translation.z - this.walkDir.z,
                })
            }
        }
        console.log(this.model.position, keysPressed)


        
    }

    updateCameraTarget(moveX,moveY, moveZ){
        const rigidTrans = this.rigidBody.translation()
        this.camera.position.x = rigidTrans.x + moveX
        this.camera.position.y = rigidTrans.y + moveY
        this.camera.position.z = rigidTrans.z + moveZ

        this.cameraTarget.x = rigidTrans.x
        this.cameraTarget.y = rigidTrans.y
        this.cameraTarget.z = rigidTrans.z
        
        this.orbitControl.target = this.cameraTarget
    }
    charOffset(keysPressed){
        var dirOffset =0
        var PIHalf = Math.PI / 2
        var PIQuarter = Math.PI /4
        if(keysPressed.back){
            if(keysPressed.left){
                dirOffset = -PIQuarter
            }
            else if(keysPressed.right){
                dirOffset = PIQuarter
            }
        }
        else if (keysPressed.forward){ 
            if(keysPressed.left){
                dirOffset = -PIQuarter - PIHalf
            }
            
            else if(keysPressed.right){
                dirOffset = PIQuarter + PIHalf
            }else{
                dirOffset = Math.PI
            }
        
        }
        else if(keysPressed.left){
            dirOffset = -PIHalf
        }
        else if(keysPressed.right){
            dirOffset = PIHalf
        }

        return dirOffset
    }

 
}