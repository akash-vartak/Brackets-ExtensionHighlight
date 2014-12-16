define(function(require, exports, module) {
    
    var CLASS_PREFIX = 'b-exthl-',
        fileInfo = {},
        sideBarColour = null,
        bgLuminance,
        constrastCache = {};

    // Get initial sidebar colour and luminance
    (function() {
        sideBarColour = $('#sidebar').css('backgroundColor').match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

        if (sideBarColour === null) {
            // Set to default value
            sideBarColour = [0,68,71,73];
        }

        bgLuminance = luminanace(sideBarColour[1],sideBarColour[2],sideBarColour[3]);

    })();

    function addDef(extension, color) {
        fileInfo[extension] = {
            color: color
        };
    }
    function addAlias(extension, other) {
        fileInfo[extension] = fileInfo[other];
    }

    // XML
    addDef('xml',       '#ff6600');
    addDef('html',      '#E34C26');
    addAlias('htm',     'html');

    // Stylesheets
    addDef('css',       '#0270b9');
    addDef('scss',      '#c6538c');
    addAlias('sass',    'scss');
    addDef('less',      '#2b5086');
    addDef('styl',      '#b3d107');

    // JavaScript
    addDef('js',        '#e5a228');
    addDef('ts',        '#0074c1');
    addDef('coffee',    '#425d99');
    addAlias('eco',     'coffee');
    addDef('json',      '#e5a228');
    addDef('ls',        '#369bd7');

    // Server side
    addDef('php',       '#6976c3');

    // Java
    addDef('java',      '#5382A1');
    addAlias('class',   'java');

    // Shell
    addDef('sh',        '#008d00');
    addDef('bat',       '#60c910');

    // Images
    addDef('png',       '#dbb1a9');
    addDef('jpg',       '#dedfa3');
    addAlias('jpeg',    'jpg');
    addDef('tiff',      '#ff4000');
    addDef('ico',       '#b6d2d1');
    addDef('gif',       '#aaecc0');
    addDef('svg',       '#c0c5eb');

    // Videos
    addDef('mp4',       '#008d00');
    addAlias('webm',    'mp4');
    addAlias('ogg',     'mp4');

    // Audio
    addDef('mp3',       '#921100');
    addAlias('wav',     'mp3');

    // Documents
    addDef('md',        '#b94700');
    addAlias('markdown','md');
    addDef('pdf',       '#FF0000');
    
    // Templating
    addDef('jade',      '#00a86b');
    
    // Git
    addDef('gitignore', '#f64d27');
    addDef('gitmodules','#f64d27');
    
    // Fonts
    addDef('ttf',       '#b42950');
    addAlias('eot',     'ttf');
    addAlias('woff',    'ttf');
    
    // Webservers
    addDef('htaccess',  '#e41a54');
    addDef('htpasswd',  '#6c369c');
    addDef('conf',      '#009900');
    
    // Puppet
    addDef('pp',        '#7761A7');
    
    // SQL
    addDef('sql',       '#008DBB');
    addDef('sqf',       '#b9e11f');
    
    // Archives
    addDef('zip',       '#008858');
    addDef('rar',       '#005888');
    addDef('7z',        '#880058');
    addDef('tgz',       '#7900BC');
    addDef('tar',       '#885800');
    addDef('gz',        '#588800');
    addDef('bzip',      '#884300');
    
    // Other text files
    addDef('txt',       '#4192c1');
    addDef('log',       '#225dc9');
    addDef('npmignore', '#cb3837');
    addDef('yml',       '#008000');
    addAlias('yaml',    'yml');
    
    // Other dot files
    addDef('classpath',      '#bbbbbb');
    addDef('properties',     '#00ff00');
    addAlias('editorconfig', 'classpath');
    addAlias('jscsrc',       'classpath');
    addAlias('jshintignore', 'classpath');
    addAlias('jshintrc',     'classpath');
    addAlias('project',      'classpath');
    addAlias('todo',         'classpath');

    // Ruby
    addDef('rb',        '#CC342D');

    // Coldfusion
    addDef('cfm',       '#74B1D4');
    addAlias('cfml',    'cfm');

    // Haxe
    addDef('hx',        '#be9c17');

    // Lua
    addDef('lua',       '#11d2bf');

    // Lua
    addDef('pl',        '#0000ff');

    // C/C++/C#
    addDef('c',         '#008985');
    addAlias('cs',      'c');
    addAlias('cpp',     'c');

    // VB
    addDef('vb',        '#0000ff');
    addDef('vbs',       '#00ff00');

    // Groovy
    addDef('groovy',    '#0000ff');

    // Scala
    addDef('scala',     '#b19714');

    // Clojure
    addDef('clj',       '#e1ce29');

    // Python
    addDef('py',        '#fdca3c');

    var def = {
        color: 'rgb(187, 187, 187)'
    }

    var ProjectManager = brackets.getModule('project/ProjectManager'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    // Add new modules for V0.44+
    try {
        var
            MainViewManager = brackets.getModule('view/MainViewManager'),
            FileTreeView = brackets.getModule("project/FileTreeView");
    } catch (e) { /* do nothing */ }

    ExtensionUtils.loadStyleSheet(module, "styles/style.css");
    
    // Create the CSS for all the classes
    (function(){

        // V0.44+ only
        if (!FileTreeView) {
            return;
        }

        // Create a new stylesheet and populate with file settings
        var contrast,
            newStyle,
            style = document.createElement('style');

        style.setAttribute('media','screen');
        style.appendChild(document.createTextNode(''));
        style.id = 'ext-highlight';
        
        document.head.appendChild(style);
        
        for (var ext in fileInfo) {
            
            contrast = getContrast(fileInfo[ext].color);

            if (contrast === false) {
                newStyle =    "color: #f1f1f1; "
                            + "background: linear-gradient(to right, rgba(0,0,0,0) 0%, " + fileInfo[ext].color + " 33%); "
                            + "border-radius: 8px; "
                            + "padding-right: 5px;";
            } else {
                newStyle = 'color: ' + fileInfo[ext].color + ';';
            }
            
            style.sheet.insertRule('.jstree-brackets li.' + CLASS_PREFIX + ext + ' span.extension {' + newStyle + '}');

        }

    })();

    function renderFiles(container, requireLeaf) {

        var aList = document.querySelectorAll(container + ' li>a');

        if (aList.length > 0) {

            $(container + ' li>a>.ext-col').remove();
            $(container + ' li>a>.extension').show();

            [].forEach.call( aList , function(el) {

                if (requireLeaf === true && !el.parentNode.classList.contains('jstree-leaf')) {
                    return false;
                }

                parseExtension( el.querySelector('.extension') );
            });

        }

    }
    
    function parseExtension(ext) {
        
        if (ext === null) {
            return;
        }
        
        var allExt = ext.innerText.substr(1).split('.'),
            x = 0, 
            extLen = allExt.length,
            data;
        
        if (extLen === 0) {
            return;
        }
        
        for (;x<extLen;x++) {
            data = fileInfo.hasOwnProperty(allExt[x]) ? fileInfo[allExt[x]] : def;
            addColour(ext, allExt[x], data);
        }
        
    }
    
    function addColour(oldExt, ext, data) {
        
        var newEle   = document.createElement('span'),
            contrast = getContrast(data.color);
        
        newEle.appendChild(document.createTextNode(ext));
        newEle.className   = 'ext-col';
        newEle.style.color = data.color;
        
        if (contrast === false) {
            newEle.style.background = "linear-gradient(to right, rgba(0,0,0,0) 0%, " + data.color + " 33%)";
            newEle.classList.add('bg-on');
        }
        
        oldExt.style.display = 'none';
        oldExt.parentNode.insertBefore(newEle, oldExt);
        
    }
    
    function getContrast(hexcolor){
        
        if (!(hexcolor in constrastCache)) {
        
            var r = parseInt(hexcolor.substr(1,2),16),
                g = parseInt(hexcolor.substr(3,2),16),
                b = parseInt(hexcolor.substr(5,2),16),
                result = luminanace(r,g,b);

            constrastCache[hexcolor] = (result / bgLuminance < 2) ? false : true;
        
        }
        
        return constrastCache[hexcolor];
    }
    
    function luminanace(r, g, b) {
        var a = [r,g,b].map(function(v) {
            v /= 255;
            return (v <= 0.03928) ?
                v / 12.92 :
                Math.pow( ((v+0.055)/1.055), 2.4 );
            });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    if (!FileTreeView) {
        // Pre V0.44
        $(ProjectManager).on('projectOpen projectRefresh', function() {
            var events = 'load_node.jstree create_node.jstree set_text.jstree';

            function doRender() {
                renderFiles('#project-files-container', true);
            }

            doRender();

            $('#project-files-container').off(events, doRender)
                                         .on(events, doRender);
        });

        renderFiles('#project-files-container', true);

    } else {
        FileTreeView.addClassesProvider(function(entry) {

            if (entry.isFile === false) {
                // Not a file, not bothered
                return;
            }

            var extInfo,
                ext = entry.name,
                lastIndex = ext.lastIndexOf('.');

            if (lastIndex >= 0) {
                ext = ext.substr(lastIndex + 1);

                if (fileInfo.hasOwnProperty(ext)) {
                    return CLASS_PREFIX + ext;
                }
            }

            return;

        });
    }

    if (MainViewManager) {
        $(MainViewManager).on("workingSetAdd workingSetAddList workingSetRemove workingSetRemoveList fileNameChange pathDeleted workingSetSort workingSetUpdate currentFileChange", function(e) {
            // renderFiles('.open-files-container');
            setTimeout(function() { renderFiles('.open-files-container'); }, 1);
        });
    } else {
        $(DocumentManager).on("workingSetAdd workingSetAddList workingSetRemove workingSetRemoveList fileNameChange pathDeleted workingSetSort", function(e) {
            renderFiles('.open-files-container');
        });
    }

    renderFiles('.open-files-container');

});
