export const  PROJECTILES ={
    ion:{
        name:"ion",
        path:"/pew/ion.png",
        speed:600,
        type:"pew"
    },
    seekerplasma:{
        name:"seekerplasma",
        path:"/pew/seekerplasma.png",
        speed:500,
    },
    greenlaser:{
        name:"greenlaser",
        path:"/pew/greenlaser.png",
        speed:800,
    },
    scud:{
        name:"scud",
        path:"/pew/scud.png",
        speed:650,
    },
    bullet:{
        name:"bullet",
        path:"/pew/bullet.png",
        speed:900
    },
    blueblaster:{
        name:"blueblaster",
        path:"/pew/blueblaster.png",
        speed:700
    },
    radtorp:{
        name:"radtorp",
        path:"/pew/radtorp.png",
        speed:550
    }
}



export const SHIPS=  [
    {
        name:"thunderhead",
        path:"/ships/thunderhead.png",
        scale:0.25,
        speed:250,
        projectile:PROJECTILES.scud
    },
    {
        name:"abomination",
        path:"/ships/abomination.png",
        scale:0.125,
        speed:220,
        projectile:PROJECTILES.seekerplasma
    },
    {
        name:"anaconda",
        path:"/ships/anaconda.png",
        scale:0.5,
        speed:300,
        projectile:PROJECTILES.greenlaser
    },
    {
        name:"arrow",
        path:"/ships/arrow.png",
        scale:0.5,
        speed:300,
        projectile:PROJECTILES.ion
    },
    {
        name:"anaconda",
        path:"/ships/anaconda.png",
        scale:0.5,
        speed:300,
        projectile:PROJECTILES.greenlaser
    },    {
        name:"anacondayellow",
        path:"/ships/anacondayellow.png",
        scale:0.125,
        speed:300,
        projectile:PROJECTILES.bullet
    },
    {
        name:"anacondablack",
        path:"/ships/anacondablack.png",
        scale:0.125,
        speed:300,
        projectile:PROJECTILES.bullet
    },
    {
        name:"anacondagreen",
        path:"/ships/anacondagreen.png",
        scale:0.125,
        speed:300,
        projectile:PROJECTILES.blueblaster
    },
    {
        name:"anacondairish",
        path:"/ships/anacondairish.png",
        scale:0.125,
        speed:300,
        projectile:PROJECTILES.radtorp
    },
];