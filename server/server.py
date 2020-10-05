from flask import Flask, render_template, request
from flask_cors import cross_origin , CORS
from flask_session import Session
from flask_socketio import SocketIO, join_room, leave_room , emit , send

app = Flask(__name__)

app.config['SECRET_KEY'] = 'secret!'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
cors = CORS(app,resources={r"/*":{"origins":"*"}})
socketio = SocketIO(app)
socketio = SocketIO(app,cors_allowed_origins="*",manage_session = False)

players = {}

# @socketio.on('message')
# def handle_message(message):
#     print('received message: ' + message)

@socketio.on('join')
@cross_origin()
def on_join(data):
    print(data)

@socketio.on('leave')
@cross_origin()
def on_leave(data):
    print(data)


@socketio.on('connection')
@cross_origin()
def handle_connection(data):
    world = {
        "id":request.sid,
        "ships": players
    }
    emit('myId',world,broadcast = False)
    data["id"] = request.sid
    players[request.sid]=data
    emit('userJoined', data,broadcast = True, include_self = False)

@socketio.on('disconnect')
@cross_origin()
def handle_disconnect():
    print(request.sid)
    players.pop(request.sid,None)

@socketio.on('hit')
def handleHit(data):
    print(data)
    socketio.emit('hit',data,broadcast = True, include_self = False)

@socketio.on('dead')
def goodbyesweetprince(data):
    players.pop(data['id'])
    socketio.emit('dead',data,broadcast = True, include_self = False)
# @socketio.on('fire'):
# def fireProjectile():


@app.route('/tick', methods= ['POST'])
@cross_origin()
def tick():
    json = request.json
    print(json)
    players[json['id']] = json
    request.sid = json['id']
    socketio.emit('update',players,broadcast = True, include_self = False)
    return "success"


# @socketio.on('tick')
# def handle_tick(data):
#     players[request.sid]=data
#     emit('update',players, broadcast = False)



if __name__ == '__main__':
    socketio.run(app,port=5000,host='0.0.0.0', debug = False)
