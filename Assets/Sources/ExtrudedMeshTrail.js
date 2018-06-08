// Generates an extrusion trail from the attached mesh
// Uses the MeshExtrusion algorithm in MeshExtrusion.cs to generate and preprocess the mesh.
var time = 2.0;
var autoCalculateOrientation = false;
var minDistance = 0.1;
var invertFaces = false;
private var srcMesh : Mesh;
private var precomputedEdges : MeshExtrusion.Edge[];

private var positions: Vector3[];
private var k: int; //counter
private var sections = new Array();
private var transforms = new Array();
private var locals = new Array();

class ExtrudedTrailSection
{
	var point : Vector3;
	var matrix : Matrix4x4;
	var time : float;
}

function Start ()
{
  
    /*var newTrans = new GameObject().transform;
     newTrans.position = positions[3];
    Debug.Log("check transform: " + newTrans);*/

    k = 0;

    positions = new Vector3[5];
    positions = [Vector3(0,0,0), Vector3(0,1,3), Vector3(0,3,4), Vector3(0,2,6), Vector3(0,0,7)];
    transforms = new Transform[5];
    locals = new Transform[5];

	srcMesh = GetComponent(MeshFilter).sharedMesh;
	precomputedEdges = MeshExtrusion.BuildManifoldEdges(srcMesh);

    for (var j:int=0; j<positions.length; j++)
    {
        var section = ExtrudedTrailSection ();
        section.point = positions[j];
        transform.position = section.point;
        section.matrix = transform.localToWorldMatrix;
        Debug.Log("section.matrix: ");
        Debug.Log(section.matrix);
        section.time = 0.1;
        //sections.Unshift(section);
        sections.Add(section);
        worldToLocal = transform.worldToLocalMatrix;
        locals.Add(worldToLocal);
    }
}



 

function LateUpdate () {
    if (k < positions.length)
    {
	var position = positions[k];  //transform.position;
    transform.position = position;
    transforms.Add(transform);
	//var now = Time.time;

    /*
	// Remove old sections
	//while (sections.length > 0 && now > sections[sections.length - 1].time + time) {
		//sections.Pop();
	//}
    */

    /*
	// Add a new trail section to beginning of array
	// if (sections.length == 0 || (sections[0].point - position).sqrMagnitude > minDistance * minDistance)
    //for (var j:int=0; j<positions.length; j++)
	//{
		var section = ExtrudedTrailSection ();
		section.point = positions[k];
        transform.position = section.point;
		section.matrix = transform.localToWorldMatrix;
		section.time = now;
		sections.Unshift(section);
	//}
	*/
    
	// We need at least 2 sections to create the line
	/*if (sections.length < 2) {
		return;
    }*/
    if (k < 1) {
        k++;
        return;
    }

	//var worldToLocal = transform.worldToLocalMatrix;
    
	var finalSections = new Matrix4x4[sections.length];
	var previousRotation : Quaternion;
	
	//for (var i=0;i<sections.length;i++)
	//{
		if (autoCalculateOrientation)
		{
            Debug.Log("AutoCalculateOrientation");
			if (k == 0)
			{
				var direction = sections[1].point - sections[0].point;
                Debug.Log(sections[1].point);
                Debug.Log(sections[0].point);
                Debug.Log(direction);
				var rotation = Quaternion.LookRotation(direction, Vector3.up);
				previousRotation = rotation;
				finalSections[k] = locals[k] * Matrix4x4.TRS(position, rotation, Vector3.one);	
                Debug.Log("k == 0");
			}
            
			// all elements get the direction by looking up the next section
			else if (k != (sections.length - 1))
			{	
                Debug.Log("k == 1--A");
				direction = sections[k + 1].point - sections[k].point;
                Debug.Log("k == 1--B");
				rotation = Quaternion.LookRotation(direction, Vector3.up);
                Debug.Log(direction);
                Debug.Log("k == 1--C");
				/*
				// When the angle of the rotation compared to the last segment is too high
				// smooth the rotation a little bit. Optimally we would smooth the entire sections array.
				if (Quaternion.Angle (previousRotation, rotation) > 20)
					rotation = Quaternion.Slerp(previousRotation, rotation, 0.5);
				*/	
				previousRotation = rotation;
				finalSections[k] = locals[k] * Matrix4x4.TRS(sections[k].point, rotation, Vector3.one);
                

			}
			// except the last one, which just copies the previous one
			else
			{
				finalSections[k] = finalSections[k-1];
			}
		}
		else
		{
        Debug.Log("No autoCalculateOrientation");
			if (k == 0)
			{
				finalSections[k] = Matrix4x4.identity;
			}
			else
			{
				finalSections[k] = locals[k] * sections[k].matrix;
			}
            MeshExtrusion.ExtrudeMesh (srcMesh, GetComponent(MeshFilter).mesh, finalSections, precomputedEdges, invertFaces);
		}
	//}



    // To make this not time based, need to first get all the needed vars into arrays.
    // Needed arrays
    // transforms
    // positions?
    // final sections
    // Then, build all in one frame, as each mesh builds on the previous.
	// Rebuild the extrusion mesh	
	//MeshExtrusion.ExtrudeMesh (srcMesh, GetComponent(MeshFilter).mesh, finalSections, precomputedEdges, invertFaces);
        k++;
    }

}

@script RequireComponent (MeshFilter)
