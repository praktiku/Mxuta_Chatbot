from flask import Flask, render_template, request, jsonify
from chat import get_response
import nltk
nltk.download('punkt')

app = Flask(__name__)


@app.get("/")
def index_get():
    return render_template("base.html")


@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    # TODO : check if text is valid

    response = get_response(text)
    message = {"answer":response}
    return jsonify(message), 200,  {'content-type': 'application/json'}

@app.post("/record")
def record():
    text = request.get_json().get("message")
    response = get_response(text)
    
    message = {"answer": response}

    return jsonify(message), 200,  {'content-type': 'application/json'}


if __name__ == "__main__":
    app.run(debug=True)