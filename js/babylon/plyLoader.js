// https://github.com/stephenLYZ/three-ply-loader/tree/master

// The MIT License (MIT)
// Copyright (c) 2017 Stephen Liu
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const plyLoader = function (data, propertyNameMapping = {}) {
    let geometry;

    function isASCII( data ) {
        var header = parseHeader(bin2strHeader(data));
        return header.format === 'ascii';
    }

    function bin2str( buf ) {
        var array_buffer = new Uint8Array( buf );
        var str = '';

        for ( var i = 0; i < buf.byteLength; i ++ ) {
            str += String.fromCharCode( array_buffer[ i ] );
        }

        return str;
    }

    function bin2strHeader(buf) { 
        var array_buffer = new Uint8Array(buf);
        var patternHeader = /ply([\s\S]*)end_header\s/;
        var str = '';
        var i = 0;

        while (!patternHeader.exec(str)) {
            str += String.fromCharCode(array_buffer[i]);
            i++;
        }

        return str;

    }

    function parseHeader( data ) {
        var patternHeader = /ply([\s\S]*)end_header\s/;
        var headerText = '';
        var headerLength = 0;
        var result = patternHeader.exec( data );

        if ( result !== null ) {
            headerText = result [ 1 ];
            headerLength = result[ 0 ].length;
        }

        var header = {
            comments: [],
            elements: [],
            headerLength: headerLength
        };

        var lines = headerText.split( '\n' );
        var currentElement;
        var lineType, lineValues;

        function make_ply_element_property( propertValues, propertyNameMapping ) {
            var property = { type: propertValues[ 0 ] };

            if ( property.type === 'list' ) {
                property.name = propertValues[ 3 ];
                property.countType = propertValues[ 1 ];
                property.itemType = propertValues[ 2 ];
            } else {
                property.name = propertValues[ 1 ];
            }

            if ( property.name in propertyNameMapping ) {
                property.name = propertyNameMapping[ property.name ];
            }

            return property;
        }

        for ( var i = 0; i < lines.length; i ++ ) {
            var line = lines[ i ];
            line = line.trim();

            if ( line === '' ) continue;

            lineValues = line.split( /\s+/ );
            lineType = lineValues.shift();
            line = lineValues.join( ' ' );

            switch ( lineType ) {
                case 'format':
                    header.format = lineValues[ 0 ];
                    header.version = lineValues[ 1 ];
                    break;
                case 'comment':
                    header.comments.push( line );
                    break;
                case 'element':
                    if ( currentElement !== undefined ) {
                        header.elements.push( currentElement );
                    }
                    currentElement = {};
                    currentElement.name = lineValues[ 0 ];
                    currentElement.count = parseInt( lineValues[ 1 ] );
                    currentElement.properties = [];
                    break;
                case 'property':
                    currentElement.properties.push( make_ply_element_property( lineValues, propertyNameMapping ) );
                    break;
                default:
                    console.log( 'unhandled', lineType, lineValues );
            }
        }

        if ( currentElement !== undefined ) {
            header.elements.push( currentElement );
        }
        return header;
    }

    function parseASCIINumber( n, type ) {
        switch ( type ) {
        case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
        case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

            return parseInt( n );

        case 'float': case 'double': case 'float32': case 'float64':

            return parseFloat( n );
        }
    }

    function parseASCIIElement( properties, line ) {
        var values = line.split( /\s+/ );
        var element = {};

        for ( var i = 0; i < properties.length; i ++ ) {
            if ( properties[ i ].type === 'list' ) {
                var list = [];
                var n = parseASCIINumber( values.shift(), properties[ i ].countType );
                for ( var j = 0; j < n; j ++ ) {
                    list.push( parseASCIINumber( values.shift(), properties[ i ].itemType ) );
                }
                element[ properties[ i ].name ] = list;
            } else {
                element[ properties[ i ].name ] = parseASCIINumber( values.shift(), properties[ i ].type );
            }
        }
        return element;
    }

    function parseASCII( data ) {
        var buffer = {
            indices : [],
            vertices : [],
            normals : [],
            uvs : [],
            colors : []
        };

        var result;

        var header = parseHeader( data );

        var patternBody = /end_header\s([\s\S]*)$/;
        var body = '';
        if ( ( result = patternBody.exec( data ) ) !== null ) {
            body = result [ 1 ];
        }

        var lines = body.split( '\n' );
        var currentElement = 0;
        var currentElementCount = 0;

        for ( var i = 0; i < lines.length; i ++ ) {
            var line = lines[ i ];
            line = line.trim();
            if ( line === '' ) {
                continue;
            }

            if ( currentElementCount >= header.elements[ currentElement ].count ) {
                currentElement ++;
                currentElementCount = 0;
            }

            var element = parseASCIIElement( header.elements[ currentElement ].properties, line );
            handleElement( buffer, header.elements[ currentElement ].name, element );
            currentElementCount ++;
        }

        return buffer;
    }

    function handleElement( buffer, elementName, element ) {
        if ( elementName === 'vertex' ) {
            buffer.vertices.push( element.x, element.y, element.z );
            if ( 'nx' in element && 'ny' in element && 'nz' in element ) {
                buffer.normals.push( element.nx, element.ny, element.nz );
            }

            if ( 's' in element && 't' in element ) {
                buffer.uvs.push( element.s, element.t );
            }

            if ( 'red' in element && 'green' in element && 'blue' in element ) {
                buffer.colors.push( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );
            }

        } else if ( elementName === 'face' ) {
            var vertex_indices = element.vertex_indices || element.vertex_index;
            if ( vertex_indices.length === 3 ) {
                buffer.indices.push( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 2 ] );
            } else if ( vertex_indices.length === 4 ) {
                buffer.indices.push( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 3 ] );
                buffer.indices.push( vertex_indices[ 1 ], vertex_indices[ 2 ], vertex_indices[ 3 ] );
            }
        }
    }

    function binaryRead( dataview, at, type, little_endian ) {
        switch ( type ) {
            case 'int8':		case 'char':	 return [ dataview.getInt8( at ), 1 ];
            case 'uint8':		case 'uchar':	 return [ dataview.getUint8( at ), 1 ];
            case 'int16':		case 'short':	 return [ dataview.getInt16( at, little_endian ), 2 ];
            case 'uint16':	case 'ushort': return [ dataview.getUint16( at, little_endian ), 2 ];
            case 'int32':		case 'int':		 return [ dataview.getInt32( at, little_endian ), 4 ];
            case 'uint32':	case 'uint':	 return [ dataview.getUint32( at, little_endian ), 4 ];
            case 'float32': case 'float':	 return [ dataview.getFloat32( at, little_endian ), 4 ];
            case 'float64': case 'double': return [ dataview.getFloat64( at, little_endian ), 8 ];
        }

    }

    function binaryReadElement( dataview, at, properties, little_endian ) {
        var element = {};
        var result, read = 0;

        for ( var i = 0; i < properties.length; i ++ ) {
            if ( properties[ i ].type === 'list' ) {
                var list = [];

                result = binaryRead( dataview, at + read, properties[ i ].countType, little_endian );
                var n = result[ 0 ];
                read += result[ 1 ];

                for ( var j = 0; j < n; j ++ ) {
                    result = binaryRead( dataview, at + read, properties[ i ].itemType, little_endian );
                    list.push( result[ 0 ] );
                    read += result[ 1 ];
                }
                element[ properties[ i ].name ] = list;
            } else {
                result = binaryRead( dataview, at + read, properties[ i ].type, little_endian );
                element[ properties[ i ].name ] = result[ 0 ];
                read += result[ 1 ];
            }
        }
        return [ element, read ];
    }

    function parseBinary( data ) {
        var buffer = {
            indices : [],
            vertices : [],
            normals : [],
            uvs : [],
            colors : []
        };

        var header = parseHeader(bin2strHeader(data));
        var little_endian = ( header.format === 'binary_little_endian' );
        var body = new DataView( data, header.headerLength );
        var result, loc = 0;

        for ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {
            for ( var currentElementCount = 0; currentElementCount < header.elements[ currentElement ].count; currentElementCount ++ ) {
                result = binaryReadElement( body, loc, header.elements[ currentElement ].properties, little_endian );
                loc += result[ 1 ];
                var element = result[ 0 ];

                handleElement( buffer, header.elements[ currentElement ].name, element );
            }
        }
        return buffer;
    }

	if ( data instanceof ArrayBuffer ) {
		geometry = isASCII( data ) ? parseASCII( bin2str( data ) ) : parseBinary( data );
	} else {
		geometry = parseASCII( data );
	}

	return geometry;
}