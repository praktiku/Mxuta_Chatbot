let seconds = 0;
let tens = 0;
let Interval;
const appendSeconds = document.querySelector('#seconds');
const appendTens = document.querySelector('#tens');
const synth = window.speechSynthesis;
let utter = new SpeechSynthesisUtterance();
utter.lang = 'id-ID'

class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            recording: document.querySelector('.recording')
        }

        this.state = false;
        this.record = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton, recording} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        recording.addEventListener('click', () => this.recording(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            // console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }
    /** Recording */
    recElement(statement){
        if(statement == true)
            setTimeout(() => {
                this.timeOfRecording(true)
                // document.querySelector('#speech').style.display = "none"

                document.querySelector('#speech').innerHTML = "Stop.."
                document.querySelector('#rec').style.display = "block"
                document.querySelector('#timer').style.display = "block"

                document.querySelector('input').style.display = "none"
                document.querySelector('#send').style.display = "none"
                
            }, 100);
        else{
            this.timeOfRecording(false)
            document.querySelector('#speech').innerHTML = "Speech"
            document.querySelector('#rec').style.display = "none"
            document.querySelector('#timer').style.display = "none"

            document.querySelector('input').style.display = "block"
            document.querySelector('#send').style.display = "block"
        }
    }
    recording(chatbox) {

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'id';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        this.record = !this.record;
        let speechToText;

        if(this.record){
            this.recElement(true)
            recognition.start()
            /** Ambil Hasil Suara Yang Telah Di Rekam */
            recognition.onresult = (event) => {
                recognition.stop
                speechToText = event.results[event.results.length - 1][0].transcript.trim();

                let msg1 = { name: "User", message: speechToText }
                this.messages.push(msg1);
                this.fetchData(speechToText, chatbox) // Fetch data dan Ambil data
                this.updateChatText(chatbox) // Update Text
                this.recElement(false) // DOM 
            }
            
        }else{
            this.recElement()
            recognition.stop
        }
        
        
    };
    fetchData(text, chatbox){
        fetch('/record', {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message: text}),
            method: 'POST',
            mode: 'cors',
        })
        .then(r => r.json())
        .then(r => {
           
            let msg2 = { name: "Sam", message: r.answer.replace(/\n/g,"<br>") };
            this.messages.push(msg2);
            this.updateChatText(chatbox)

            utter.text = r.answer;
            synth.speak(utter)

            textField.value = ''
            
            
        }).catch((error) => {
            // console.error('Error:', JSON.parse(error));
        
        });
    }
   /**Count Recording Number */
    timeOfRecording(statement){
        if(statement == true){
            clearInterval(Interval)
            Interval = setInterval(this.timer, 10)
            console.log("Timer Start...")
        }
        else{
            clearInterval(Interval);
            tens = 0;
            seconds = 0;
            appendTens.innerHTML =  "0" + tens;
            appendSeconds.innerHTML = "0" + seconds;
            console.log("Timer Stop...")
        };
    }
    timer(){
        tens++;
        if(tens <= 9){
            appendTens.innerHTML = "0" + tens
        }
        if(tens > 9){
            appendTens.innerHTML = tens
        }
        if(tens > 99){
            seconds++;
            appendSeconds.innerHTML = "0" + seconds;
            tens = 0;
            appendTens.innerHTML = "0" + 0;
        }
        if (seconds > 9){
            appendSeconds.innerHTML = seconds;
        }
    }
    
    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Sam")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

function saveBlob(blob, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}
if(!('webkitSpeechRecognition' in window)){
    alert('maaf browser anda tidak didukung dengan speech kami. 😭')
}
const chatbox = new Chatbox();
chatbox.display();