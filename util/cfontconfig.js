import  cfonts  from "cfonts";

export default function cfontconfig() {
    cfonts.say('MS PLAY|BOT', {
        font: 'block',              // define the font face
        align: 'center',              // define text alignment
        colors: ['system'],         // define all colors
        background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
        letterSpacing: 1,           // define letter spacing
        lineHeight: 1,              // define the line height
        space: true,                // define if the output text should have empty lines on top and on the bottom
        maxLength: '100',             // define how many character can be on one line
        gradient: ['red', 'blue'],            // define your two gradient colors
        independentGradient: false, // define if you want to recalculate the gradient for each new line
        transitionGradient: false,  // define if this is a transition between colors directly
        rawMode: false,             // define if the line breaks should be CRLF (`\r\n`) over the default LF (`\n`)
        env: 'node'                 // define the environment cfonts is being executed in
    });
}