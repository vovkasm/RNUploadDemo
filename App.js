import React from "react";
import { Button, StyleSheet, Text, View, Image } from "react-native";
import { RNCamera as Camera } from "react-native-camera";

export default class App extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.state = {
      showScreen: false,
      localImage: undefined,
      remoteImage: undefined,
    };
  }

  render() {
    return (
      <View style={{ flex: 1, paddingTop: 20 }}>
        {this.state.showScreen
          ? this.renderUploadedImage()
          : this.renderCamera()}
      </View>
    );
  }

  renderUploadedImage() {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <View>
          <Button title="Back" onPress={this.handleBack} />
        </View>
        <View style={s.flex}>
          <Text>Local image</Text>
          <MyImage uri={this.state.localImage} />
        </View>
        <View style={s.flex}>
          <Text>Remote image</Text>
          <MyImage uri={this.state.remoteImage} />
        </View>
      </View>
    );
  }

  renderCamera() {
    return (
      <Camera style={s.flex} ref={this.setCameraRef}>
        <Button title="Snap" onPress={this.handleSnap} />
      </Camera>
    );
  }

  setCameraRef = ref => {
    this.camera = ref;
  };

  handleBack = () => {
    this.setState({ showScreen: false });
  };

  handleSnap = () => {
    if (this.camera) {
      this.camera
        .takePictureAsync()
        .then(photo => {
          this.setState({ showScreen: true, localImage: photo.uri });
          return this.uploadPictureToserver(photo);
        })
        .catch(e => {
          console.log('handleSnap error', e);
        });
    }
  };

  uploadPictureToserver(photo) {
    const serverUrl = "https://file.io";

    // Without form-data, only plain image (we use this scheme on our servers)
    // const options = {
    //   method: "POST",
    //   headers: { "Content-type": "image/jpeg" },
    //   body: { uri: photo.uri },
    // }

    // With form-data (most servers)

    const data = new FormData()
    data.append('file', {
      uri: photo.uri,
      type: 'image/jpeg',
      name: 'test.jpg'
    })
    const options = { method: 'POST', body: data }
    upload(serverUrl, options)
      .then(xhr => {
        return xhr.response
      })
      .then(data => {
        console.log('uploadPictureToserver response', data)
        if (typeof data === 'string') {
          data = JSON.parse(data)
        }
        if (typeof data === 'object' && data.link) {
          this.setState({ remoteImage: data.link })
        } else {
          throw new Error('icorrect data')
        }
      })
      .catch(e => {
        console.log('uploadPictureToserver error: ', e);
      });
  };

}

const MyImage = (props) => {
  if (props.uri) {
    return <Image style={{ width: 100, height: 100 }} source={{ uri: props.uri }} />
  } else {
    return (<View style={{ width: 100, height: 100 }}><Text>No image</Text></View>)
  }
}

const s = StyleSheet.create({
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center"
  },
  flex: {
    flex: 1
  },
  row: {
    flex: 1,
    flexDirection: "row"
  }
});

function upload(url, opts, onProgress) {
  if (!opts) opts = {}
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(opts.method || 'GET', url)
    const headers = opts.headers || {}
    for (const k in headers) {
      if (headers.hasOwnProperty(k)) {
        xhr.setRequestHeader(k, headers[k])
      }
    }
    xhr.onload = (e) => resolve(e.target)
    xhr.onerror = (e) => reject(e.target)
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (ev) => {
        onProgress(ev) // event.loaded / event.total * 100 ; //event.lengthComputable
      }
    }
    xhr.send(opts.body)
  })
}