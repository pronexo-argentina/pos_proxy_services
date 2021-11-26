import ctypes
from ctypes import byref, c_int, c_char, c_long, c_short, create_string_buffer
#Here you load the dll into python 
MyDllObject = ctypes.cdll.LoadLibrary("X:\\Clientes\\Pronexo\\Hassar\\Programacion\\Python\\Windows\\Python\\hasarHasarCom.dll")
MyFunctionObject = MyDllObject.MyFunctionName
#define the types that your C# function return
MyFunctionObject.restype = ctypes.c_wchar_p
#define the types that your C# function will use as arguments
MyFunctionObject.argtypes = [ctypes.c_wchar_p]
#That's it now you can test it
print(MyFunctionObject("Python Message"))