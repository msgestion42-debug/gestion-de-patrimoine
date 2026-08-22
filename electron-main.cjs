const {app,BrowserWindow,shell}=require('electron');
const path=require('path');

function createWindow(){
  const win=new BrowserWindow({
    width:1280,
    height:860,
    minWidth:900,
    minHeight:650,
    autoHideMenuBar:true,
    webPreferences:{
      contextIsolation:true,
      nodeIntegration:false,
      spellcheck:true
    }
  });

  win.loadFile(path.join(__dirname,'index.html'));

  // Explicitly focus the web contents on Windows so HTML input/textarea fields
  // receive keyboard events immediately after a click.
  win.once('ready-to-show',()=>{
    win.show();
    win.focus();
    win.webContents.focus();
  });
  win.webContents.on('did-finish-load',()=>win.webContents.focus());

  win.webContents.setWindowOpenHandler(({url})=>{
    shell.openExternal(url);
    return{action:'deny'};
  });
}

app.whenReady().then(()=>{
  createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
