from flask import Flask, render_template, request
from flask_cors import cross_origin , CORS
from flask_session import Session
from flask_socketio import SocketIO, join_room, leave_room , emit , send

app = Flask(__name__)

app.config['SECRET_KEY'] = 'secret!'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
CORS(app)
socketio = SocketIO(app,cors_allowed_origins="*",manage_session = False)

players = {}

# @socketio.on('message')
# def handle_message(message):
#     print('received message: ' + message)

@socketio.on('join')
def on_join(data):
    print(data)

@socketio.on('leave')
def on_leave(data):
    print(data)


@socketio.on('connection')
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
def handle_disconnect():
    print(request.sid)
    players.pop(request.sid,None)

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

# @socketio.on('hit')
# def handle_tick(data):
#     socketio.emit('',{id:data.id},broadcast = True, include_self = False)


if __name__ == '__main__':
    socketio.run(app)